import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ senderID: req.user.id })
            .populate("senderID", "-password -createdAt -__v")
            .populate("chatID", "-createdAt -__v");

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate("senderID", "-password -createdAt -__v")
            .populate("chatID", "-createdAt -__v");

        if (!message) {
            return res.status(404).json({ success: false, msg: "Message not found" });
        }

        if (message.senderID._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    const { chatId, message } = req.body;
    const SpecifiedChat = await Chat.findById(chatId);
    if (!SpecifiedChat) {
        return res.status(404).json({ success: false, msg: "Chat not found" });
    }
    if (!message) {
        return res.status(400).json({ success: false, msg: "Please add a message" });
    }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, msg: "Unauthorized: User not found" });
    }

    const newMessage = await Message.create({
      senderID: req.user.id,
      chatID: chatId,
      text: message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
}

export const updateMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, msg: "Please add a message" });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        const existingMessage = await Message.findById(req.params.id);
        if (!existingMessage) {
            return res.status(404).json({ success: false, msg: "Message not found" });
        }

        if (existingMessage.senderID.toString() !== user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id,
            { text: message },
            { new: true }
        );

        res.status(200).json(updatedMessage);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, msg: "Message not found" });
        }

        if (message.senderID.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        await message.remove();

        res.status(200).json({ success: true, msg: "Message deleted" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};



