



const express = require("express");
const userAuth = require("../middleware/auth");
const chatModel = require("../models/chat");
const mongoose = require("mongoose");

const router = express.Router();

// Get chat by targetUserId - Filter deleted message and hides old cleared messages
router.get("/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    console.log("Fetching chat for:", { userId, targetUserId });

    let chat = await chatModel.findOne({
      particpants: { $all: [userId, targetUserId] }
    });

    if (!chat) {
      console.log("Chat not found, creating new one");
      chat = new chatModel({
        particpants: [userId, targetUserId],
        messages: [],
        clearedAt: []
      });

      await chat.save();
    }

    // Initialize clearedAt if it doesn't exist
    if (!chat.clearedAt) {
      chat.clearedAt = [];
    }

    // Find when current user clear the chat
    const userClearRecord = chat.clearedAt.find(
      (record) => record.userId.toString() === userId.toString()
    );

    // Filter messages: hide message created BEFORE chat clear time, show new messages AFTER clear time
    const visibleMessages = chat.messages.filter((msg) => {
      // Initialize deletedBy if it doesn't exist
      if (!msg.deletedBy) {
        msg.deletedBy = [];
      }

      // Check if current user has deleted  specific message
      const userDeletedMessage = msg.deletedBy.some(
        (id) => id.toString() === userId.toString()
      );

      // If user deleted this message, don't show it
      if (userDeletedMessage) {
        return false;
      }

      // If chat was cleared, only show messages created AFTER clear time
      if (userClearRecord) {
        const messageCreatedTime = new Date(msg.createdAt).getTime();
        const clearTime = new Date(userClearRecord.clearedTimestamp).getTime();
        return messageCreatedTime > clearTime;
      }

      // If chat was never cleared, show all messages (except deleted ones)
      return true;
    });

    const chatResponse = {
      _id: chat._id,
      particpants: chat.particpants,
      messages: visibleMessages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    };

    console.log("Chat fetched successfully:", {
      chatId: chat._id.toString(),
      totalMessages: chat.messages.length,
      visibleMessages: visibleMessages.length,
      userId: userId.toString()
    });

    res.status(200).json(chatResponse);
  } catch (err) {
    console.error("Error in GET chat route:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
     
    });
  }
});





// Delete a single message 
router.delete("/:chatId/message/:messageId", userAuth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id;

   

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const chat = await chatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isParticipant = chat.particpants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    const messageIndex = chat.messages.findIndex(
      (msg) => msg._id.toString() === messageId.toString()
    );

    if (messageIndex === -1) {
      console.log("Message not found. Available messages:", chat.messages.map(m => m._id.toString()));
      return res.status(404).json({ message: "Message not found" });
    }

    const message = chat.messages[messageIndex];

    if (!message.deletedBy) {
      message.deletedBy = [];
    }

    const alreadyDeleted = message.deletedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyDeleted) {
      message.deletedBy.push(userId);
    }

    await chat.save();


    res.status(200).json({
      message: "Message deleted successfully",
      success: true,
      deletedMessageId: messageId
    });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

// Clear entire chat for current user ,hides old messages, shows new ones


// router.delete("/:chatId", userAuth, async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.user._id;

//     console.log("Clear chat request:", { chatId, userId: userId.toString() });

//     if (!mongoose.Types.ObjectId.isValid(chatId)) {
//       return res.status(400).json({ message: "Invalid chat ID" });
//     }

//     const chat = await chatModel.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     const isParticipant = chat.particpants.some(
//       (p) => p.toString() === userId.toString()
//     );

//     if (!isParticipant) {
//       return res.status(403).json({ message: "You are not a participant in this chat" });
//     }

//     if (!chat.clearedAt) {
//       chat.clearedAt = [];
//     }

//     // Check if user has already cleared this chat
//     const alreadyCleared = chat.clearedAt.some(
//       (record) => record.userId.toString() === userId.toString()
//     );

//     if (!alreadyCleared) {
//       chat.clearedAt.push({
//         userId: userId,
//         clearedTimestamp: new Date()
//       });
//     }

//     await chat.save();

//     console.log("Chat cleared for user:", userId.toString());

//     res.status(200).json({
//       message: "Chat cleared successfully",
//       success: true
//     });
//   } catch (err) {
//     console.error("Error clearing chat:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message
//     });
//   }
// });




module.exports = router;




