
const socket = require("socket.io");
const crypto = require("crypto");
const { parseCookie } = require("cookie")
const jwt = require("jsonwebtoken");
const UserStatus = require("../models/userStatus");
const ConnectionRequest = require("../models/connectionRequest");

const CreateSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

// Remembers who is currently in a call: userId -> { peerId, callId }
const activeCalls = new Map();

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "https://truebond-six.vercel.app"],
      credentials: true,
    },
  });

  //  NEW: authentication 
  // Runs once for every new connection. If it fails, the connection is refused.
  io.use((socket, next) => {
    try {
    const rawCookies = socket.handshake.headers.cookie;
    console.log("Socket handshake cookie header:", rawCookies ? "present" : "MISSING");

    const token = parseCookie(rawCookies).token
    console.log("Token cookie:", token ? "found" : "NOT FOUND");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded._id;
    next();
  } catch (err) {
    console.log("Socket auth failed:", err.message);
    next(new Error("unauthorized"));
  }
  });

  io.on("connection", async (socket) => {
    const me = socket.userId;
    console.log("New client connected:", socket.id, "user:", me);

    //  CHANGED: replaces the old "register-user" event 
    // Happens automatically on every connect (and reconnect).
    socket.join(`user:${me}`);
    try {
      await UserStatus.findOneAndUpdate(
        { user: me },
        { isOnline: true, socketId: socket.id, lastSeen: new Date() },
        { upsert: true, new: true }
      );
      io.emit("user:status:changed", { userId: me, isOnline: true, lastSeen: new Date() });
    } catch (error) {
      console.error("Error setting online status:", error);
    }

    //  your existing handlers (unchanged) 
    socket.on("user:offline", async () => {
      try {
        await UserStatus.findOneAndUpdate({ user: me }, { isOnline: false, lastSeen: new Date() });
        io.emit("user:status:changed", { userId: me, isOnline: false, lastSeen: new Date() });
        socket.leave(`user:${me}`);
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    });

    socket.on("joinChat", ({ userId, targetUserId }) => {
      socket.join(CreateSecretRoomId(me, targetUserId));
    });

    socket.on("user:typing", ({ targetUserId, isTyping }) => {
      io.to(`user:${targetUserId}`).emit("user:typing:status", { userId: me, isTyping });
    });

    socket.on("message:broadcast", (data) => {
      try {
        const { targetUserId, messageId, text, messageType, mediaFiles, timestamp } = data;
        io.to(`user:${targetUserId}`).emit("message:broadcast", {
          userId: me, messageId, text, messageType, mediaFiles, timestamp,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to broadcast message" });
      }
    });

    socket.on("message:read", ({ targetUserId, messageId }) => {
      io.to(`user:${targetUserId}`).emit("message:read:status", { messageId, isRead: true });
    });

    socket.on("deleteMessage", ({ targetUserId, messageId }) => {
      io.to(`user:${targetUserId}`).emit("message:deleted", { messageId,isRead:true });
    });

    //  NEW: call signaling 

    // 1) Caller asks to start a call
    socket.on("call:invite", async ({ to, callType }, ack) => {
      try {
        // must be accepted connections
        const connected = await ConnectionRequest.exists({
          status: "accepted",
          $or: [
            { fromUserId: me, toUserId: to },
            { fromUserId: to, toUserId: me },
          ],
        });
        if (!connected) return ack?.({ error: "not_connected" });

        // callee must be online
        const sockets = await io.in(`user:${to}`).fetchSockets();
        if (sockets.length === 0) return ack?.({ error: "offline" });

        // nobody can be in two calls
        if (activeCalls.has(me) || activeCalls.has(to)) return ack?.({ error: "busy" });

        const callId = crypto.randomUUID();
        activeCalls.set(me, { peerId: to, callId });
        activeCalls.set(to, { peerId: me, callId });

        // ring the callee
        io.to(`user:${to}`).emit("call:incoming", { from: me, callType, callId });
        ack?.({ callId });
      } catch (err) {
        console.error("call:invite error:", err);
        ack?.({ error: "server_error" });
      }
    });

    // 2) Everything else is just "pass this message to the other person"
    const relayEvents = [
      "call:accept", "call:reject", "call:end",
      "webrtc:offer", "webrtc:answer", "webrtc:ice",
    ];

    relayEvents.forEach((event) => {
      socket.on(event, (payload = {}) => {
        const call = activeCalls.get(me);
        // only allowed between the two people in the active call
        if (!call || call.peerId !== payload.to) return;

        io.to(`user:${payload.to}`).emit(event, { ...payload, from: me });

        // call is over: free both users
        if (event === "call:reject" || event === "call:end") {
          activeCalls.delete(me);
          activeCalls.delete(payload.to);
        }
      });
    });

    //  disconnect (existing + call cleanup) 
   socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      try {
        // The user may still be connected from another tab / socket.
        // Only treat them as gone when their LAST socket closes.
        const remaining = await io.in(`user:${me}`).fetchSockets();
        if (remaining.length > 0) return;
 
        await UserStatus.findOneAndUpdate(
          { user: me },
          { isOnline: false, lastSeen: new Date() }
        );
        io.emit("user:status:changed", { userId: me, isOnline: false, lastSeen: new Date() });
 
        // if this user was in a call, tell the other person it ended
        const call = activeCalls.get(me);
        if (call) {
          io.to(`user:${call.peerId}`).emit("call:end", { from: me, reason: "disconnected" });
          activeCalls.delete(me);
          activeCalls.delete(call.peerId);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    socket.on("error", (error) => console.error("Socket error:", error));
  });
};

module.exports = initializeSocket;


