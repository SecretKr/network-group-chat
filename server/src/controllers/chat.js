import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

const sanitizeUsers = "-password -createdAt -__v";

export const getChats = async (req, res) => {
  try {
    const userChats = await Chat.find({
      users: req.user._id,
      isGroupChat: false,
    }).populate("users", sanitizeUsers);

    if (!userChats || userChats.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No chats found for this user",
      });
    }

    res.status(200).json(userChats);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to get chats" });
  }
};

export const getGroupChats = async (req, res) => {
  try {
    const groupChats = await Chat.find({
      users: req.user._id,
      isGroupChat: true,
    }).populate("users", sanitizeUsers);

    res.status(200).json(groupChats);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to get group chats" });
  }
};

export const createChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, msg: "Missing userId" });
  }

  if (userId === req.user._id.toString()) {
    return res
      .status(400)
      .json({ success: false, msg: "Cannot create chat with yourself" });
  }

  try {
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId], $size: 2 },
    }).populate("users", sanitizeUsers);

    if (existingChat) {
      return res.status(409).json({
        success: false,
        message: `Chat already exists with ${otherUser.nickname}`,
      });
    }

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      sanitizeUsers
    );
    res.status(200).json(fullChat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to create chat" });
  }
};

export const createGroupChat = async (req, res) => {
  const { chatName, users } = req.body;

  if (!chatName || !users || !Array.isArray(users) || users.length === 0) {
    return res
      .status(400)
      .json({ success: false, msg: "Name and at least one user required" });
  }

  if (users.includes(req.user._id.toString())) {
    return res
      .status(400)
      .json({ success: false, msg: "You can't add yourself manually" });
  }

  try {
    const allUsersExist = await User.find({ _id: { $in: users } });
    if (allUsersExist.length !== users.length) {
      return res
        .status(400)
        .json({ success: false, msg: "Some users not found" });
    }

    const newGroupChat = await Chat.create({
      chatName,
      users: [...users, req.user._id],
      isGroupChat: true,
    });

    const fullGroupChat = await Chat.findById(newGroupChat._id).populate(
      "users",
      sanitizeUsers
    );
    res.status(200).json(fullGroupChat);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Failed to create group chat" });
  }
};

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res
      .status(400)
      .json({ success: false, msg: "chatId and userId are required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ success: false, msg: "Group chat not found" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate("users", sanitizeUsers);

    res.status(200).json(updatedChat);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Failed to add user to group" });
  }
};

export const getChat = async (req, res) => {
  try {
    const chatDetails = await Chat.findById(req.params.id).populate(
      "users",
      sanitizeUsers
    );

    if (!chatDetails) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    if (
      !chatDetails.users.some(
        (user) => user._id.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ success: false, msg: "Unauthorized access to chat" });
    }

    res.status(200).json(chatDetails);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Failed to fetch chat details" });
  }
};

export const updateChat = async (req, res) => {
  const { chatName } = req.body;

  if (!chatName) {
    return res
      .status(400)
      .json({ success: false, msg: "chatName is required" });
  }

  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    chat.chatName = chatName;
    await chat.save();
    await chat.populate("users", sanitizeUsers);

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to update chat" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    await chat.deleteOne();

    res.status(200).json({ success: true, msg: "Chat deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to delete chat" });
  }
};

export const getMessagesChat = async (req, res) => {
  try {
    const chatDetails = await Chat.findById(req.params.id);
    if (!chatDetails) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    if (!chatDetails.users.includes(req.user._id)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    const chatMessages = await Message.find({ chatId: req.params.id }).sort({
      createdAt: 1,
    });

    res.status(200).json(chatMessages);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to get messages" });
  }
};
