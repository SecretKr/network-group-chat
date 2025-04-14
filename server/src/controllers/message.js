import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ senderId: req.user.id })
            .populate("senderId", "-password -createdAt -__v")
            .populate("chatId", "-createdAt -__v");

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate("senderId", "-password -createdAt -__v")
            .populate("chatId", "-createdAt -__v");

        if (!message) {
            return res.status(404).json({ success: false, msg: "Message not found" });
        }

        if (message.senderId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    const { chatId, text } = req.body;
    const specifiedChat = await Chat.findById(chatId);
    if (!specifiedChat) {
        return res.status(404).json({ success: false, msg: "Chat not found" });
    }
    if (!text) {
        return res.status(400).json({ success: false, msg: "Please add a message" });
    }

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, msg: "Unauthorized: User not found" });
        }

        const newMessage = await Message.create({
            senderId: req.user.id,
            chatId: chatId,
            text: text,
        });

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const updateMessage = async (req, res) => {
    const { text } = req.body;

    if (!text) {
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

        if (existingMessage.senderId.toString() !== user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id,
            { text: text },
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

        if (message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, msg: "Unauthorized: You are not the sender of this message" });
        }

        await message.remove();

        res.status(200).json({ success: true, msg: "Message deleted" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};
