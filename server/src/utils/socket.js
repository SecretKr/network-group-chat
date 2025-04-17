import Chat from "../models/Chat.js";
import { io } from "../server.js";

export const broadcastAllOpenChat = async () => {
  try {
    const groupChats = await Chat.find({ isGroupChat: true }).select(
      "_id chatName"
    );

    const chatList = groupChats.map((chat) => ({
      chatId: chat._id,
      chatName: chat.chatName,
    }));

    io.emit("openChatList", chatList); // Broadcast to all connected clients
  } catch (err) {
    console.error("Failed to broadcast chat list:", err.message);
  }
};

export const broadcastMyOpenChats = async (userId, socket) => {
  try {
    const groupChats = await Chat.find({
      users: userId,
      isGroupChat: true,
    }).select("_id chatName");

    const chatList = groupChats.map((chat) => ({
      chatId: chat._id,
      chatName: chat.chatName,
    }));

    socket.emit("myOpenChatList", chatList); // Emit only to that user's socket
  } catch (err) {
    console.error("Failed to send user's open chat list:", err.message);
  }
};
