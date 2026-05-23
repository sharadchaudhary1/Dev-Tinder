


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  text: {
    type: String,
    
  },
   mediaFiles: [
    {
      url: String,
      fileType: String, 
      fileName: String,
      size: Number,
    }
  ],
  messageType: {
    type: String,
    enum: ['text', 'media', 'mixed'],
    default: 'text',
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  particpants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  ],
  messages: [messageSchema],
  clearedAt: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    clearedTimestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;




