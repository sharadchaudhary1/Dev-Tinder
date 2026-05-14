


const socket = require("socket.io");
const crypto = require("crypto");
const ChatModel = require("../models/chat");

const CreateSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const userSocketMap = new Map();

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
    console.log("User connected:", socket.id);

    socket.on("register-user", (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log("User registered:", userId);
    });

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = CreateSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, senderId, text }) => {
      const roomId = CreateSecretRoomId(userId, targetUserId);

      try {
        console.log("Sending message from:", userId, "to:", targetUserId);

        let chat = await ChatModel.findOne({
          particpants: { $all: [userId, targetUserId] }
        });

        if (!chat) {
          console.log("Chat not found, creating new one");
          chat = new ChatModel({
            particpants: [userId, targetUserId],
            messages: [],
            clearedAt: []
          });
        }

        if (!chat.clearedAt) {
          chat.clearedAt = [];
        }

        // Create new message with empty deletedBy array
        const newMessage = {
          senderId: userId,
          text: text,
          deletedBy: []
        };

        chat.messages.push(newMessage);
        await chat.save();

        console.log("Message saved successfully");

        // Get  saved message ID
        const savedMessage = chat.messages[chat.messages.length - 1];

        // Emit to all users in the room
        io.to(roomId).emit("messageReceived", {
          userId: targetUserId,
          senderId: userId,
          text: text,
          messageId: savedMessage._id,
          timestamp: savedMessage.createdAt,
          deletedBy: []
        });

        console.log("Message emitted to room:", roomId);

      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("error", { message: "Failed to save message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;