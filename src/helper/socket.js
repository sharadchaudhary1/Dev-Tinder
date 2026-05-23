
const socket = require("socket.io");
const crypto = require("crypto");
const UserStatus = require("../models/userStatus");

const CreateSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://truebond-six.vercel.app"
      ],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

   
    // Register user 
    socket.on("register-user", async (userId) => {
      try {
        // Update user status 
        await UserStatus.findOneAndUpdate(
          { user: userId },
          {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date(),
          },
          { upsert: true, new: true }
        );

        // Join user personal room
        socket.join(`user:${userId}`);

        // Broadcast status to all connected users
        io.emit("user:status:changed", {
          userId,
          isOnline: true,
          lastSeen: new Date(),
        });

        // console.log(` User ${userId} registered with socket ${socket.id}`);
      } catch (error) {
        console.error("Error registering user:", error);
      }
    });

    // User goes offline
    socket.on("user:offline", async (userId) => {
      try {
        await UserStatus.findOneAndUpdate(
          { user: userId },
          {
            isOnline: false,
            lastSeen: new Date(),
          }
        );

        io.emit("user:status:changed", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(`user:${userId}`);
        // console.log(` User ${userId} is offline`);
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    });


    // Join chat room 
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = CreateSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      // console.log(` User ${userId} joined chat room ${roomId}`);
    });

  

    socket.on("user:typing", (data) => {
      const { userId, targetUserId, isTyping } = data;

      // Send typing status to recipient's personal room
      io.to(`user:${targetUserId}`).emit("user:typing:status", {
        userId: userId,
        isTyping,
      });

      console.log(`  User ${userId} is ${isTyping ? "typing" : "stopped typing"}`);
    });

 

    // Broadcast message notification 
    socket.on("message:broadcast", (data) => {
      try {
        const { userId, targetUserId, messageId, text, messageType, mediaFiles, timestamp } = data;

        // Send notification to recipient's personal room
        io.to(`user:${targetUserId}`).emit("message:broadcast", {
          userId,
          messageId,
          text,
          messageType,
          mediaFiles,
          timestamp
        });

        // console.log(` Message ${messageId} broadcasted to user ${targetUserId}`);
      } catch (error) {
        console.error("Error broadcasting message:", error);
        socket.emit("error", { message: "Failed to broadcast message" });
      }
    });

    // Mark message as read
    socket.on("message:read", (data) => {
      const { userId, targetUserId, messageId } = data;

      io.to(`user:${targetUserId}`).emit("message:read:status", {
        messageId: messageId,
        isRead: true,
      });

      console.log(` Message ${messageId} marked as read`);
    });

    // Delete message 
    socket.on("deleteMessage", (data) => {
      const { userId, targetUserId, messageId } = data;

      io.to(`user:${targetUserId}`).emit("message:deleted", {
        messageId: messageId,
      });

      // console.log(` Message ${messageId} deleted`);
    });

   

    socket.on("disconnect", async () => {
      console.log(" User disconnected:", socket.id);

      try {
        const userStatus = await UserStatus.findOneAndUpdate(
          { socketId: socket.id },
          {
            isOnline: false,
            lastSeen: new Date(),
          },
          { new: true }
        );

        if (userStatus) {
          io.emit("user:status:changed", {
            userId: userStatus.user,
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    // Error 
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

module.exports = initializeSocket;




