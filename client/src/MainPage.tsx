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
import { toast } from "react-toastify";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { AllGroupModal } from "./components/AllGroupModal";

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

export type OpenChat = {
  chatId: string;
  chatName: string;
};

export const socket = io(process.env.REACT_APP_BACKEND_URL);

const MainPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageMap>({});
  const [userList, setUserList] = useState<UserWithStatus[]>([]);
  const [myOpenChatList, setMyOpenChatList] = useState<OpenChat[]>([]);
  const userListRef = useRef<UserWithStatus[]>([]);
  const pendingSocketUsersRef = useRef<string[] | null>(null);
  const [chatUsersReady, setChatUsersReady] = useState(false);
  const [userToChat, setUserToChat] = useState("");
  const [chatId, setChatId] = useState("");
  const [selectedChat, setSelectedChat] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAllGroupModal, setShowAllGroupModal] = useState(false);

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
      console.log("Socket connection established with UID:", uid);
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

    socket.on("openChatList", (userChats: OpenChat[]) => {
      console.log("Received open chat list:", userChats);
      setMyOpenChatList(userChats);
    });

    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      const fromUser = data.senderId;
      const isActiveChat = fromUser === userToChat;

      const newMessage: Message = {
        username: fromUser,
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

    return () => {
      socket.off("userList");
      socket.off("receiveMessage");
    };
  }, [socket, uid, userToChat, chatUsersReady]);

  const getUnreadCount = (uid: string) => messages[uid]?.unread || 0;
  const chatUserObj = userList.find(
    (u) => u.uid_name.split(":")[0] === userToChat
  );

  const handleCreateChat = () => {
    const memberUIDs = userList.map((user) => {
      const uid = user.uid_name.split(":")[0];
      console.log(`🔍 Extracted UID: ${uid} from ${user.uid_name}`);
      return uid;
    });

    console.log("👥 Member UIDs for group chat:", memberUIDs);

    if (!uid || !name) {
      console.error("❌ Missing current user ID or name", { uid, name });
      toast.error("User info missing");
      return;
    }

    if (memberUIDs.length === 0) {
      console.warn("⚠️ No members to create group chat with");
      toast.error("No members selected");
      return;
    }

    const payload = {
      chatName: `${name}'s Group`,
      isGroupChat: true,
      members: memberUIDs,
    };

    console.log("📦 Emitting 'createChat' with payload:", payload);

    socket.emit("createChat", payload, (response: any) => {
      console.log("Server Response:", response);
    });

    toast.success("Group chat creation requested");
  };

  socket.on("chatListUpdate", (userChats) => {
    console.log("🔔 Received updated chat list:", userChats);
  });

  if (!loggedIn) return <LoginPage />;

  return (
    <div className="w-screen h-screen flex bg-white">
      <Sidebar
        userList={userList}
        openChatList={myOpenChatList}
        username={name}
        setUserToChat={onUserSelect}
        userToChat={userToChat}
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
      {selectedChat && (
        <Chatbox
          handleBack={handleBack}
          userToChat={userToChat}
          messages={messages}
          setMessage={setMessage}
          message={message}
          sendPrivateMessage={onSendPrivateMessage}
          chatUserObj={chatUserObj || null}
        />
      )}
    </div>
  );
};

export default MainPage;
