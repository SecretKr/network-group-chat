import { useState, useEffect, useMemo, useRef } from "react";
import io from "socket.io-client";

import { LoginPage } from "./components/Login-Page";
import { Sidebar } from "./components/Sidebar";
import { Chatbox } from "./components/Chatbox";
import { useAuth } from "./auth/AuthContext";
import { getPrivateChats } from "./utils/privateChat";
import {
  handleUserToChat,
  sendPrivateMessage,
  mergeOnlineStatus,
} from "./utils/chatHelpers";

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
  uid_name: string; // format: uid:name
  online: boolean;
};

const MainPage = () => {
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageMap>({});
  const [userList, setUserList] = useState<UserWithStatus[]>([]);
  const userListRef = useRef<UserWithStatus[]>([]);
  const pendingSocketUsersRef = useRef<string[] | null>(null);
  const [chatUsersReady, setChatUsersReady] = useState(false);
  const [userToChat, setUserToChat] = useState("");
  const [chatId, setChatId] = useState("");
  const [selectedChat, setSelectedChat] = useState(false);

  const { uid, name, token, loggedIn } = useAuth();

  const handleBack = () => {
    setUserToChat("");
    setSelectedChat(false);
  };

  const onUserSelect = (user: string) => {
    handleUserToChat(
      user,
      uid,
      name,
      token,
      setUserToChat,
      setSelectedChat,
      setChatId,
      setMessages
    );
  };

  const onSendPrivateMessage = () => {
    sendPrivateMessage(
      userToChat,
      message,
      uid,
      socket,
      chatId,
      token,
      setMessage,
      setMessages
    );
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      const chats = await getPrivateChats(token);
      const chatUsers = new Set<string>();

      chats?.forEach((chat) => {
        chat.users.forEach((user) => {
          if (user._id !== uid) {
            chatUsers.add(`${user._id}:${user.nickname}`);
          }
        });
      });

      const baseList: UserWithStatus[] = Array.from(chatUsers).map((u) => ({
        uid_name: u,
        online: false,
      }));

      userListRef.current = baseList;
      setChatUsersReady(true);
      if (pendingSocketUsersRef.current) {
        const updated = mergeOnlineStatus(
          baseList,
          pendingSocketUsersRef.current,
          uid
        );
        setUserList(updated);
        pendingSocketUsersRef.current = null;
      } else {
        setUserList(baseList);
      }
    };

    if (loggedIn && token) {
      fetchChatUsers();
    }
  }, [loggedIn, token, uid]);

  useEffect(() => {
    if (loggedIn && uid) {
      socket.emit("setUsername", `${uid}:${name}`);
    }
  }, [loggedIn, uid, name, socket]);

  useEffect(() => {
    socket.on("userList", (onlineUsers: string[]) => {
      if (!chatUsersReady) {
        pendingSocketUsersRef.current = onlineUsers;
      } else {
        const updated = mergeOnlineStatus(
          userListRef.current,
          onlineUsers,
          uid
        );
        setUserList(updated);
      }
    });

    socket.on("receiveMessage", (data) => {
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
  }, [socket, uid, userToChat, chatUsersReady]);

  const getUnreadCount = (user: string) => messages[user]?.unread || 0;
  const chatUserObj = userList.find((u) => u.uid_name === userToChat);
  const onlineStatus = chatUserObj?.online;

  if (!loggedIn) return <LoginPage />;

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        userList={userList}
        username={name}
        setUserToChat={onUserSelect}
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
          sendPrivateMessage={onSendPrivateMessage}
          onlineStatus={onlineStatus}
        />
      )}
    </div>
  );
};

export default MainPage;
