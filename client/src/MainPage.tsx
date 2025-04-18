import { useState, useEffect, useRef } from "react";
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
  handleGroupToChat,
} from "./utils/chatHelpers";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { AllGroupModal } from "./components/AllGroupModal";
import { AllGroupMember } from "./components/AllGroupMember";
import { putApiV1ChatByIdLeave } from "./generated/api";

export type Message = {
  chatId?: string;
  username?: string;
  uid?: string;
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
  const [showAllGroupMember, setShowAllGroupMember] = useState(false);

  const { uid, name, token, loggedIn } = useAuth();

  const handleBack = () => {
    setUserToChat("");
    setChatId("");
    setSelectedChat(false);
  };

  const handleLeaveChat = async () => {
    try {
      await putApiV1ChatByIdLeave({
        path: {
          id: chatId,
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setMyOpenChatList((prev) =>
        prev.filter((chat) => chat.chatId !== chatId)
      );
      handleBack();
    } catch (error) {
      console.error("Failed to leave chat:", error);
      alert("An error occurred while trying to leave the chat.");
    }
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

  const onGroupSelect = (chatId: string) => {
    handleGroupToChat(
      chatId,
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
      name,
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
  }, [uid, userToChat, chatUsersReady, chatId]);

  const getUnreadCount = (uid: string) => messages[uid]?.unread || 0;
  const chatUserObj = userList.find(
    (u) => u.uid_name.split(":")[0] === userToChat
  );
  const chatGroupObj = myOpenChatList.find((g) => g.chatId === chatId) || null;

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
        setGroupToChat={onGroupSelect}
        userToChat={userToChat}
        setChatId={setChatId}
        chatId={chatId}
        getUnreadCount={getUnreadCount}
        showAllGroupModal={() => setShowAllGroupModal(true)}
        showCreateGroupModal={() => setShowCreateGroupModal(true)}
      />
      {showAllGroupModal && (
        <AllGroupModal
          onClose={() => setShowAllGroupModal(false)}
          myOpenChatList={myOpenChatList}
        />
      )}
      {showCreateGroupModal && (
        <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />
      )}
      {showAllGroupMember && (
        <AllGroupMember
          onClose={() => setShowAllGroupMember(false)}
          handleLeaveChat={handleLeaveChat}
          chatId={chatId}
          token={token}
        />
      )}
      {selectedChat && (
        <Chatbox
          isGroupChat={userToChat === "" && chatId !== ""}
          handleBack={handleBack}
          userToChat={userToChat}
          chatId={chatId}
          messages={messages}
          setMessage={setMessage}
          message={message}
          sendPrivateMessage={onSendPrivateMessage}
          chatUserObj={chatUserObj || null}
          chatGroupObj={chatGroupObj || null}
          showAllGroupMember={() => setShowAllGroupMember(true)}
        />
      )}
    </div>
  );
};

export default MainPage;
