import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChats = async (req, res) => {
  try {
    const userChats = await Chat.find({ users: req.user._id, isGroupChat: false })
      .populate("users", "-password -createdAt -__v");

    res.status(200).json(userChats);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getGroupChats = async (req, res) => {
  try {
    const groupChats = await Chat.find({ users: req.user._id, isGroupChat: true })
      .populate("users", "-password -createdAt -__v");

    res.status(200).json(groupChats);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const createChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, msg: "Please add a userId" });
  }

  try {
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId], $size: 2 },
    }).populate("users", "-password -createdAt -__v");

    if (existingChat) {
      return res.status(404).json({
        success: false,
        message: `Chat already exists with ${(await User.findById(userId)).nickname}`,
      });
    }

    const newChatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const newChat = await Chat.create(newChatData);

    const fullChat = await Chat.findOne({ _id: newChat._id })
      .populate("users", "-password -createdAt -__v");

    res.status(200).json(fullChat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const createGroupChat = async (req, res) => {
  const { chatName, users } = req.body;

  if (!chatName || !users) {
    return res.status(400).json({ success: false, msg: "Please add a name and users" });
  }

  try {
    const newGroupChat = await Chat.create({
      chatName,
      users: [...users, req.user._id],
      isGroupChat: true,
    });

    const fullGroupChat = await Chat.findOne({ _id: newGroupChat._id })
      .populate("users", "-password -createdAt -__v");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ success: false, msg: "Please add a chatId and userId" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate("users", "-password -createdAt -__v");

    if (!updatedChat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json(updatedChat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getChat = async (req, res) => {
  try {
    const chatDetails = await Chat.findById(req.params.id)
      .populate("users", "-password -createdAt -__v");

    if (!chatDetails) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json(chatDetails);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const updateChat = async (req, res) => {
  const { chatName } = req.body;

  if (!chatName) {
    return res.status(400).json({ success: false, msg: "Please add a name" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.id,
      { chatName },
      { new: true }
    ).populate("users", "-password -createdAt -__v");

    if (!updatedChat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json(updatedChat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);

    if (!deletedChat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json({ success: true, msg: "Chat deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getMessagesChat = async (req, res) => {
  try {
    const chatDetails = await Chat.findById(req.params.id);
    if (!chatDetails) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }
    if (!chatDetails.users.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    const chatMessages = await Message.find({ chatId: req.params.id })
      .sort({ createdAt: 1 });

    if (!chatMessages) {
      return res.status(404).json({ success: false, msg: "Messages not found" });
    }

    res.status(200).json(chatMessages);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};