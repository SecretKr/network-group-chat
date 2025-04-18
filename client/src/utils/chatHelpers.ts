import { toast } from "react-toastify";
import { createPrivateChat, getPrivateChats } from "./privateChat";
import { getMessagesByChatId } from "./message";
import { Message, MessageMap, UserWithStatus } from "../MainPage";

export const handleUserToChat = async (
  user: string,
  uid: string,
  name: string,
  token: string,
  setUserToChat: (user: string) => void,
  setSelectedChat: (val: boolean) => void,
  setChatId: (id: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<MessageMap>>
) => {
  setUserToChat(user);
  setSelectedChat(true);

  let chats = await getPrivateChats(token);
  let chatIdLocal = "";

  const targetUserId = user.split(":")[0];
  let foundChat = chats?.find((chat) =>
    chat.users.some((u) => u._id === targetUserId)
  );

  if (foundChat) {
    chatIdLocal = foundChat._id;
    setChatId(chatIdLocal);
    //toast.success("Join private chat successfully");
  } else {
    const res = await createPrivateChat(user, token);
    if (res) {
      //toast.success("Create private chat successfully");
      chats = await getPrivateChats(token);
      foundChat = chats?.find((chat) =>
        chat.users.some((u) => u._id === targetUserId)
      );
      if (foundChat) {
        chatIdLocal = foundChat._id;
        setChatId(chatIdLocal);
      }
    } else {
      toast.error("Something went wrong");
      return;
    }
  }

  const messageHistory = await getMessagesByChatId(chatIdLocal, token);
  if (messageHistory) {
    const formattedMessages = messageHistory.map((msg) => ({
      ...msg,
      uid: msg.uid === uid ? `${uid}:${name}` : user,
      username: msg.username,
    }));

    setMessages((prev) => ({
      ...prev,
      [user]: { messages: formattedMessages, unread: 0 },
    }));
  }
};

export const handleGroupToChat = async (
  chatId: string,
  token: string,
  setUserToChat: (user: string) => void,
  setSelectedChat: (val: boolean) => void,
  setChatId: (id: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<MessageMap>>
) => {
  setChatId(chatId);
  setUserToChat("");
  setSelectedChat(true);

  const messageHistory = await getMessagesByChatId(chatId, token);
  if (messageHistory) {
    const formattedMessages = messageHistory.map((msg) => ({
      ...msg,
      uid: msg.uid,
      username: msg.username,
    }));

    setMessages((prev) => ({
      ...prev,
      [chatId]: { messages: formattedMessages, unread: 0 },
    }));
  }
};

export const sendPrivateMessage = async (
  userToChat: string,
  message: string,
  uid: string,
  socket: any,
  chatId: string,
  name: string,
  setMessage: (val: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<MessageMap>>
) => {
  //if (!userToChat || !message.trim()) return;

  const newMessage: Message = {
    message,
    username: name,
    uid: uid,
    read: false,
  };

  socket.emit("sendMessage", {
    chatId: chatId,
    text: message,
  });

  if (userToChat !== "") {
    setMessages((prev) => {
      const existing = prev[userToChat] || { messages: [], unread: 0 };
      return {
        ...prev,
        [userToChat]: {
          messages: [...existing.messages, newMessage],
          unread: existing.unread,
        },
      };
    });
  } else {
    setMessages((prev) => {
      const existing = prev[chatId] || { messages: [], unread: 0 };
      return {
        ...prev,
        [chatId]: {
          messages: [...existing.messages, newMessage],
          unread: 0,
        },
      };
    });
  }

  // const res = await createMessage(chatId, message, token);
  // res
  //   ? toast.success("Create message successfully")
  //   : toast.error("Something went wrong");

  setMessage("");
};

export const mergeOnlineStatus = (
  baseList: UserWithStatus[],
  onlineUsers: string[],
  uid: string
): UserWithStatus[] => {
  const updated = baseList.map((user) => ({
    ...user,
    online: onlineUsers.includes(user.uid_name),
  }));

  onlineUsers.forEach((online) => {
    if (
      !updated.some((user) => user.uid_name === online) &&
      online.split(":")[0] !== uid
    ) {
      updated.push({ uid_name: online, online: true });
    }
  });

  return updated;
};
