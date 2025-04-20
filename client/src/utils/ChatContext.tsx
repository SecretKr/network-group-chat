import { createContext, useContext, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { socket } from "../MainPage";
import { createPrivateChat, getPrivateChats } from "./privateChat";
import { getMessagesByChatId } from "./message";
import { putApiV1ChatByIdLeave } from "../generated/api";

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

interface ChatContextType {
  messages: MessageMap;
  setMessages: React.Dispatch<React.SetStateAction<MessageMap>>;
  userList: UserWithStatus[];
  setUserList: React.Dispatch<React.SetStateAction<UserWithStatus[]>>;
  myOpenChatList: OpenChat[];
  setMyOpenChatList: React.Dispatch<React.SetStateAction<OpenChat[]>>;
  userToChat: string;
  setUserToChat: React.Dispatch<React.SetStateAction<string>>;
  chatId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  selectedChat: boolean;
  setSelectedChat: React.Dispatch<React.SetStateAction<boolean>>;
  handleUserSelect: (user: string) => Promise<void>;
  handleGroupSelect: (chatId: string) => Promise<void>;
  handleSendMessage: (message: string) => Promise<void>;
  handleLeaveChat: () => Promise<void>;
  handleBack: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<MessageMap>({});
  const [userList, setUserList] = useState<UserWithStatus[]>([]);
  const [myOpenChatList, setMyOpenChatList] = useState<OpenChat[]>([]);
  const [userToChat, setUserToChat] = useState("");
  const [chatId, setChatId] = useState("");
  const [selectedChat, setSelectedChat] = useState(false);
  const { uid, name, token } = useAuth();

  const handleUserSelect = async (user: string) => {
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
    } else {
      const res = await createPrivateChat(user, token);
      if (res) {
        chats = await getPrivateChats(token);
        foundChat = chats?.find((chat) =>
          chat.users.some((u) => u._id === targetUserId)
        );
        if (foundChat) {
          chatIdLocal = foundChat._id;
          setChatId(chatIdLocal);
        }
      } else {
        console.log("Something went wrong");
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

  const handleGroupSelect = async (chatId: string) => {
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

  const handleSendMessage = async (message: string) => {
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

  const handleBack = () => {
    setUserToChat("");
    setChatId("");
    setSelectedChat(false);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        userList,
        setUserList,
        myOpenChatList,
        setMyOpenChatList,
        userToChat,
        setUserToChat,
        chatId,
        setChatId,
        selectedChat,
        setSelectedChat,
        handleUserSelect,
        handleGroupSelect,
        handleSendMessage,
        handleLeaveChat,
        handleBack,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
