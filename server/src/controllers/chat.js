import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id , isGroupChat: false })
      .populate("users", "-password -createdAt -__v")

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getGroupChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id, isGroupChat: true })
      .populate("users", "-password -createdAt -__v")

    res.status(200).json(chats);
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
    // Check if a chat already exists with the same users
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId], $size: 2 },
    })    .populate("users", "-password -createdAt -__v");

    if (existingChat) {
      return res.status(404).json({
        success: false,
        message: `Chat already exists with ${(await User.findById(userId)).nickname}`,
      });
    }

    // Create a new chat if it doesn't exist
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const chat = await Chat.create(chatData);

    const fullChat = await Chat.findOne({ _id: chat._id })
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
      const groupChat = await Chat.create({
        chatName,
        users: [...users, req.user._id],
        isGroupChat: true,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password -createdAt -__v")
  
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
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $addToSet: { users: userId } },
        { new: true }
      )
        .populate("users", "-password -createdAt -__v")
  
      if (!chat) {
        return res.status(404).json({ success: false, msg: "Chat not found" });
      }
  
      res.status(200).json(chat);
    } catch (err) {
      res.status(500).json({ success: false, msg: "Server Error" });
    }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("users", "-password -createdAt -__v")

    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json(chat);
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
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { chatName },
      { new: true }
    )
      .populate("users", "-password -createdAt -__v")

    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);

    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    res.status(200).json({ success: true, msg: "Chat deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getMessagesChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }
    if(!chat.users.includes(req.user._id.toString())){
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    const messages = await Message.find({ chatID: req.params.id })
      .sort({ createdAt: 1 });

    if (!messages) {
      return res.status(404).json({ success: false, msg: "Messages not found" });
    }

      res.status(200).json(messages);
  } catch (err) {
      res.status(500).json({ success: false, msg: "Server Error" });
  }
}