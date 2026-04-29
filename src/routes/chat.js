const express = require("express");
const userAuth = require("../middleware/auth");
const chatModel = require("../models/chat");

const router = express.Router();

router.get('/:targetUserId', userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    let chat = await chatModel.findOne({
      particpants: { $all: [userId, targetUserId] }
    });

    if (!chat) {
      chat = new chatModel({
        particpants: [userId, targetUserId],
        messages: []
      });

      await chat.save();
    }
     console.log(chat)
       res.status(200).json(chat);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
