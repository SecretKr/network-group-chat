import { Icon } from "@iconify/react";
import { MessageMap, OpenChat, UserWithStatus } from "../MainPage";
import { useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";

interface ChatboxProps {
  isGroupChat: boolean;
  handleBack: () => void;
  userToChat: string | null;
  chatId: string;
  messages: MessageMap;
  setMessage: (message: string) => void;
  message: string;
  sendPrivateMessage: () => void;
  chatUserObj: UserWithStatus | null;
  chatGroupObj: OpenChat | null;
  showAllGroupMember: () => void;
}

export function Chatbox({
  isGroupChat,
  handleBack,
  userToChat,
  chatId,
  messages,
  setMessage,
  message,
  sendPrivateMessage,
  chatUserObj,
  chatGroupObj,
  showAllGroupMember,
}: ChatboxProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { uid } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, userToChat]);

  return (
    <div className="flex-1 flex flex-col p-6 bg-background">
      <div className="text-center relative">
        <div
          className="cursor-pointer flex gap-2 items-center text-secondary absolute left-0 w-full md:hidden"
          onClick={handleBack}
        >
          <Icon icon="weui:back-filled" width="12" height="24" />
          <p className="text-xl">Back</p>
        </div>
        <div className={`flex items-center mb-4 gap-4 ${
          isGroupChat? "justify-between" : ""}`}
        >
          <h1 className="text-2xl font-bold">
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
            <button
              className="bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
              onClick={showAllGroupMember}
            >
              Show All Group Members
            </button>
          )}
        </div>
      </div>

      {userToChat && !isGroupChat ? (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded-md border-hover">
          {(messages[userToChat]?.messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.uid === userToChat ? "justify-start" : "justify-end"
              }`}
            >
              <div
                key={index}
                className={`max-w-sm p-3 rounded-lg break-words relative mt-3 ${
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
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded-md border-hover">
          {(messages[chatId]?.messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.uid !== uid ? "justify-start" : "justify-end"
              }`}
            >
              <div
                key={index}
                className={`max-w-xs p-3 rounded-lg break-words relative mt-3 ${
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
              sendPrivateMessage();
            }
          }}
          className="flex-1 p-[11px] border border-hover rounded-md resize-none select-none focus:outline-none"
        />
        <button
          onClick={sendPrivateMessage}
          className="bg-primary text-white h-12 w-12 rounded-md hover:bg-primary-dark transition flex items-center justify-center"
        >
          <Icon icon="mdi:send" className="size-6" />
        </button>
      </div>
    </div>
  );
}
