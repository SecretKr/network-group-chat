import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

import { LoginPage } from "./components/Login-Page";
import { Sidebar } from "./components/Sidebar";
import { Chatbox } from "./components/Chatbox";
import { useAuth } from "./auth/AuthContext";
import { createPrivateChat, getPrivateChats } from "./utils/privateChat";
import { createMessage, getMessagesByChatId } from "./utils/message";

export type Message = {
  username?: string;
  message: string;
  read: boolean;
};

export type MessageMap = {
  [username: string]: {
    messages: Message[];
    unread: number;
  };
};

export type UserWithStatus = {
  username: string; // format: uid:name
  online: boolean;
};

const MainPage = () => {
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageMap>({});
  const [userList, setUserList] = useState<UserWithStatus[]>([]);
  const [userToChat, setUserToChat] = useState("");
  const [chatId, setChatId] = useState("");
  const [selectedChat, setSelectedChat] = useState(false);

  const { uid, name, token, loggedIn } = useAuth();

  const handleUserToChat = async (user: string) => {
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
      toast.success("Join private chat successfully");
    } else {
      const res = await createPrivateChat(user, token);
      if (res) {
        toast.success("Create private chat successfully");
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
        username: msg.username === uid ? `${uid}:${name}` : user,
      }));

      setMessages((prev) => ({
        ...prev,
        [user]: { messages: formattedMessages, unread: 0 },
      }));
    }
  };

  const handleBack = () => {
    setUserToChat("");
    setSelectedChat(false);
  };

  const sendPrivateMessage = async () => {
    if (!userToChat || !message.trim()) return;
    console.log("Sending message:", message, userToChat);
    const newMessage: Message = {
      message,
      read: false,
    };

    socket.emit("sendMessage", {
      chatId: chatId,
      text: message,
    });

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

    const res = await createMessage(chatId, message, token);
    res
      ? toast.success("Create message successfully")
      : toast.error("Something went wrong");

    setMessage("");
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      const chats = await getPrivateChats(token);
      const chatUsers = new Set<string>();

      chats?.forEach((chat) => {
        chat.users.forEach((user) => {
          if (user._id !== uid) {
            chatUsers.add(`${user._id}:${user.username}`);
          }
        });
      });

      setUserList((prev) => {
        // Preserve online status if available, otherwise default to offline
        const updatedList: UserWithStatus[] = Array.from(chatUsers).map((u) => {
          const existing = prev.find((prevU) => prevU.username === u);
          return {
            username: u,
            online: existing?.online || false,
          };
        });
        return updatedList;
      });
    };

    if (loggedIn && token) {
      fetchChatUsers();
    }
  }, [loggedIn, token, uid]);

  useEffect(() => {
    if (loggedIn && uid) {
      socket.emit("setUsername", `${uid}:${name}`);
      console.log("Socket connection established with UID:", uid);
    }
  }, [loggedIn, uid, name, socket]);

  useEffect(() => {
    socket.on("userList", (onlineUsers: string[]) => {
      setUserList((prev) => {
        const updated = [...prev];
        updated.forEach((user) => (user.online = false));
        onlineUsers.forEach((online) => {
          const index = updated.findIndex((user) => user.username === online);
          if (index !== -1) {
            updated[index].online = true;
          } else if (online.split(":")[0] !== uid) {
            updated.push({ username: online, online: true });
          }
        });

        return updated;
      });
    });

    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      const fromUser = data.username;
      const isActiveChat = fromUser === userToChat;

      const newMessage: Message = {
        username: fromUser,
        message: data.message,
        read: isActiveChat,
      };

      setMessages((prev) => {
        const existing = prev[fromUser] || { messages: [], unread: 0 };
        return {
          ...prev,
          [fromUser]: {
            messages: [...existing.messages, newMessage],
            unread: isActiveChat ? 0 : existing.unread + 1,
          },
        };
      });
    });

    return () => {
      socket.off("userList");
      socket.off("receiveMessage");
    };
  }, [socket, uid, userToChat]);

  const getUnreadCount = (user: string) => messages[user]?.unread || 0;
  const chatUserObj = userList.find((u) => u.username === userToChat);
  const onlineStatus = chatUserObj?.online;

  if (!loggedIn) return <LoginPage />;

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        userList={userList}
        username={name}
        setUserToChat={handleUserToChat}
        userToChat={userToChat}
        getUnreadCount={getUnreadCount}
      />
      <button className="flex w-10 h-10 bg-red-500" onClick={sendPrivateMessage}> test
      </button>
      {selectedChat && (
        <Chatbox
          handleBack={handleBack}
          userToChat={userToChat}
          messages={messages}
          setMessage={setMessage}
          message={message}
          sendPrivateMessage={sendPrivateMessage}
          onlineStatus={onlineStatus}
        />
      )}
    </div>
  );
};

export default MainPage;
