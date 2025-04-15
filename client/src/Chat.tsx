import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { LoginPage } from "./components/Login-Page";
import { Sidebar } from "./components/Sidebar";
import { Chatbox } from "./components/Chatbox";
import { toast } from "react-toastify";
import { useAuth } from "./auth/AuthContext";
import { createPrivateChat, getPrivateChats, Chat } from "./utils/privateChat";
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

const MainPage = () => {
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageMap>({});
  const [userList, setUserList] = useState<string[]>([]);
  const [userToChat, setUserToChat] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<boolean>(false);

  const { uid, name, token, loggedIn } = useAuth();

  //
  console.log(uid);
  console.log(name);
  console.log(loggedIn);
  //

  const handleUserToChat = async (user: string) => {
    setUserToChat(user);
    setSelectedChat(true);

    const chats: Chat[] | null = await getPrivateChats(token);
    var created = false;
    var chatId_local: string = "";
    if (chats) {
      for (const chat of chats) {
        for (const u of chat.users) {
          if (u._id === user.split(":")[0]) {
            created = true;
            setChatId(chat._id);
            chatId_local = chat._id;
            break;
          }
        }
        if (created) break;
      }
      if (created) {
        toast.success("Join private chat successfully");
      } else {
        const res = await createPrivateChat(user, token);
        if (res) {
          toast.success("Create private chat successfully");
        } else {
          toast.error("Something went wrong");
        }
      }
    } else {
      const res = await createPrivateChat(user, token);
      if (res) {
        toast.success("Create private chat successfully");
      } else {
        toast.error("Something went wrong");
      }
      const chats: Chat[] | null = await getPrivateChats(token);
      var got = false;
      if (chats) {
        for (const chat of chats) {
          for (const u of chat.users) {
            if (u._id === user.split(":")[0]) {
              got = true;
              setChatId(chat._id);
              chatId_local = chat._id;
              break;
            }
          }
          if (got) break;
        }
      }
    }

    const messageHistory = await getMessagesByChatId(chatId_local, token);
    if (messageHistory) {
      for (let i = 0; i < messageHistory.length; i++) {
        if (messageHistory[i].username === uid) {
          messageHistory[i].username = messageHistory[i].username + `:${name}`
        } else {
          messageHistory[i].username = user
        }
      }
      setMessages((prev) => {
        return {
          ...prev,
          [user]: {
            messages: messageHistory,
            unread: 0,
          },
        };
      });
    }
  };

  const handleBack = () => {
    setUserToChat("");
    setSelectedChat(false);
  };

  const sendPrivateMessage = async () => {
    if (userToChat && message.trim()) {
      const newMessage: Message = {
        message,
        read: false,
      };

      console.log("Sending message:", newMessage, userToChat);

      socket.emit("sendMessage", {
        targetUser: userToChat,
        message,
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
      if (res) {
        toast.success("Create message successfully");
      } else {
        toast.error("Something went wrong");
      }

      setMessage("");
    }
  };

  useEffect(() => {
    if (loggedIn && uid) {
      socket.emit("setUsername", uid + ":" + name);
    }
  }, [loggedIn, uid, name, socket]);

  const getUnreadCount = (user: string) => messages[user]?.unread || 0;

  useEffect(() => {
    socket.on("userList", (users: string[]) => {
      setUserList(users.filter((user) => user.split(":")[0] !== uid));
    });

    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      const fromUser = data.username;
      const newMessage: Message = {
        username: fromUser,
        message: data.message,
        read: data.username === userToChat,
      };
      setMessages((prev) => {
        const existing = prev[fromUser] || { messages: [], unread: 0 };
        const isActiveChat = fromUser === userToChat;
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

  if (!loggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        userList={userList}
        username={name}
        setUserToChat={handleUserToChat}
        userToChat={userToChat}
        getUnreadCount={getUnreadCount}
      />

      {selectedChat && (
        <Chatbox
          handleBack={handleBack}
          userToChat={userToChat}
          messages={messages}
          setMessage={setMessage}
          message={message}
          sendPrivateMessage={sendPrivateMessage}
        />
      )}
    </div>
  );
};

export default MainPage;
