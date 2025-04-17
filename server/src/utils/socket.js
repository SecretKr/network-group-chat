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
