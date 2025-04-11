import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { LoginPage } from "./components/Login-Page";
import { Sidebar } from "./components/Sidebar";
import { Chatbox } from "./components/Chatbox";

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

const Chat = () => {
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageMap>({});
  const [username, setUsername] = useState<string>("");
  const [userList, setUserList] = useState<string[]>([]);
  const [userToChat, setUserToChat] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      setLoggedIn(true);
    }
  };

  const handleUserToChat = (user: string) => {
    setUserToChat(user);
    setSelectedChat(true);
    setMessages((prev) => {
      const existing = prev[user] || { messages: [], unread: 0 };
      return {
        ...prev,
        [user]: {
          messages: existing.messages.map((msg) =>
            msg.username === user ? { ...msg, read: true } : msg
          ),
          unread: 0,
        },
      };
    });
  };

  const handleBack = () => {
    setUserToChat("");
    setSelectedChat(false);
  };

  const sendPrivateMessage = () => {
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

      setMessage("");
    }
  };

  const getUnreadCount = (user: string) => messages[user]?.unread || 0;

  useEffect(() => {
    socket.on("userList", (users: string[]) => {
      setUserList(users.filter((user) => user !== username));
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
  }, [socket, username, userToChat]);

  if (!loggedIn) {
    return (
      <LoginPage
        setUsername={setUsername}
        username={username}
        handleJoin={handleJoin}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        userList={userList}
        username={username}
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

export default Chat;
