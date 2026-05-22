


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }]
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







