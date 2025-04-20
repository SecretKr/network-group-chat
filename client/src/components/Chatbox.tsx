import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useChat } from "../utils/ChatContext";

interface ChatboxProps {
  showAllGroupMember: () => void;
}

export function Chatbox({ showAllGroupMember }: ChatboxProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { uid } = useAuth();
  const {
    messages,
    userList,
    myOpenChatList,
    chatId,
    userToChat,
    handleSendMessage,
    handleBack,
  } = useChat();

  const isGroupChat = userToChat === "" && chatId !== "";
  const chatUserObj = userList.find(
    (u) => u.uid_name.split(":")[0] === userToChat
  );
  const chatGroupObj = myOpenChatList.find((g) => g.chatId === chatId) || null;

  const onSendMessage = () => {
    handleSendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, userToChat]);

  return (
    <div className="flex-1 flex flex-col p-4 bg-background">
      <div className="text-center relative h-[58px]">
        <div
          className={`flex items-center justify-center pb-4 h-full gap-4 ${
            isGroupChat ? "justify-between" : ""
          }`}
        >
          <div
            className="cursor-pointer flex gap-2 items-center text-secondary  left-0 md:hidden"
            onClick={handleBack}
          >
            <Icon icon="weui:back-filled" width="12" height="24" />
            <p className="text-xl">Back</p>
          </div>
          <h1 className="text-2xl font-bold w-full md:w-auto">
            {chatUserObj?.uid_name.split(":")[1]}
            {isGroupChat && chatGroupObj?.chatName}
          </h1>
          {chatUserObj && (
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  chatUserObj.online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span>{chatUserObj.online ? "Online" : "Offline"}</span>
            </div>
          )}
          {isGroupChat && (
            <div className="flex gap-3 ">
              <button
                className="bg-primary text-white font-semibold p-1 rounded-md hover:bg-primary-dark transition"
                onClick={showAllGroupMember}
              >
                <Icon icon="ic:round-menu" className="size-8 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {userToChat && !isGroupChat ? (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 rounded-md">
          {(messages[userToChat]?.messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                msg.uid === userToChat ? "justify-start" : "justify-end"
              }`}
            >
              {msg.uid !== userToChat && (
                <p className="text-sm text-gray-400 flex items-end">
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              )}
              <div
                key={index}
                className={`max-w-64 md:max-w-sm p-3 rounded-lg break-words relative mt-3 ${
                  msg.uid === userToChat ? "bg-gray-200" : "bg-primary-light"
                }`}
              >
                <p
                  className={`absolute text-sm text-gray-400 -top-5 ${
                    msg.uid === userToChat ? " left-1" : "right-1"
                  }`}
                >
                  {msg.username}
                </p>
                {msg.message}
              </div>
              {msg.uid === userToChat && (
                <p className="text-sm text-gray-400 flex items-end">
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 rounded-md">
          {(messages[chatId]?.messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                msg.uid !== uid ? "justify-start" : "justify-end"
              }`}
            >
              {msg.uid === uid && (
                <p className="text-sm text-gray-400 flex items-end">
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              )}
              <div
                key={index}
                className={`max-w-64 md:max-w-sm p-3 rounded-lg break-words relative mt-3 ${
                  msg.uid !== uid ? "bg-gray-200" : "bg-primary-light"
                }`}
              >
                <p
                  className={`absolute text-sm text-gray-400 -top-5 ${
                    msg.uid !== uid ? " left-1" : "right-1"
                  }`}
                >
                  {msg.username}
                </p>
                {msg.message}
              </div>
              {msg.uid !== uid && (
                <p className="text-sm text-gray-400 flex items-end">
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="flex h-12 gap-2 justify-center">
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          className="flex-1 p-[11px] rounded-md resize-none select-none focus:outline-none"
        />
        <button
          onClick={onSendMessage}
          className="bg-primary text-white h-12 w-12 rounded-md hover:bg-primary-dark transition flex items-center justify-center"
        >
          <Icon icon="mdi:send" className="size-6" />
        </button>
      </div>
    </div>
  );
}
