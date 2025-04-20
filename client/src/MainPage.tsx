import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import { LoginPage } from "./components/Login-Page";
import { Sidebar } from "./components/Sidebar";
import { Chatbox } from "./components/Chatbox";
import { useAuth } from "./auth/AuthContext";
import { getPrivateChats } from "./utils/privateChat";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { AllGroupModal } from "./components/AllGroupModal";
import { AllGroupMember } from "./components/AllGroupMember";
import {
  Message,
  OpenChat,
  useChat,
  UserWithStatus,
} from "./utils/ChatContext";

export const socket = io(process.env.REACT_APP_BACKEND_URL);

const MainPage = () => {
  const userListRef = useRef<UserWithStatus[]>([]);
  const pendingSocketUsersRef = useRef<string[] | null>(null);
  const [chatUsersReady, setChatUsersReady] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAllGroupModal, setShowAllGroupModal] = useState(false);
  const [showAllGroupMember, setShowAllGroupMember] = useState(false);
  const { uid, name, token, loggedIn } = useAuth();
  const {
    messages,
    setMessages,
    setUserList,
    setMyOpenChatList,
    userToChat,
    chatId,
    selectedChat,
  } = useChat();

  const mergeOnlineStatus = (
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
  }, [loggedIn, token, uid, setUserList]);

  useEffect(() => {
    if (loggedIn && uid) {
      socket.emit("setUsername", `${uid}:${name}`);
      console.log("Socket connection established with UID:", uid);
    }
  }, [loggedIn, uid, name]);

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

    socket.on("myOpenChatList", (userChats: OpenChat[]) => {
      setMyOpenChatList(userChats);
    });

    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      const fromUser = data.senderId;
      const isActiveChat = fromUser === userToChat;
      if (uid === fromUser) return;

      const newMessage: Message = {
        uid: fromUser,
        username: data.username,
        message: data.text,
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

    socket.on("receiveGroupMessage", (data) => {
      console.log("Received message:", data);
      const fromUser = data.senderId;
      const isActiveGroup = chatId === data.chatId && !userToChat;
      if (uid === fromUser) return;

      const newMessage: Message = {
        chatId: chatId,
        uid: fromUser,
        username: data.username,
        message: data.text,
        read: isActiveGroup,
      };

      setMessages((prev) => {
        const existing = prev[chatId] || { messages: [], unread: 0 };
        return {
          ...prev,
          [chatId]: {
            messages: [...existing.messages, newMessage],
            unread: isActiveGroup ? 0 : existing.unread + 1,
          },
        };
      });
    });

    return () => {
      socket.off("userList");
      socket.off("receiveMessage");
      socket.off("myOpenChatList");
      socket.off("receiveGroupMessage");
    };
  }, [
    uid,
    userToChat,
    chatUsersReady,
    chatId,
    setMessages,
    setUserList,
    setMyOpenChatList,
  ]);

  const getUnreadCount = (uid: string) => messages[uid]?.unread || 0;

  socket.on("chatListUpdate", (userChats) => {
    console.log("🔔 Received updated chat list:", userChats);
  });

  if (!loggedIn) return <LoginPage />;

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        getUnreadCount={getUnreadCount}
        showAllGroupModal={() => setShowAllGroupModal(true)}
        showCreateGroupModal={() => setShowCreateGroupModal(true)}
      />
      {showAllGroupModal && (
        <AllGroupModal onClose={() => setShowAllGroupModal(false)} />
      )}
      {showCreateGroupModal && (
        <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />
      )}
      {showAllGroupMember && (
        <AllGroupMember onClose={() => setShowAllGroupMember(false)} />
      )}
      {selectedChat && (
        <Chatbox showAllGroupMember={() => setShowAllGroupMember(true)} />
      )}
    </div>
  );
};

export default MainPage;
