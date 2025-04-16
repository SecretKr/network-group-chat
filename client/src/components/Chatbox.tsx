import { Icon } from "@iconify/react";
import { MessageMap } from "../MainPage";

interface ChatboxProps {
  handleBack: () => void;
  userToChat: string | null;
  messages: MessageMap;
  setMessage: (message: string) => void;
  message: string;
  sendPrivateMessage: () => void;
  onlineStatus?: boolean;
}

export function Chatbox({
  handleBack,
  userToChat,
  messages,
  setMessage,
  message,
  sendPrivateMessage,
  onlineStatus = false,
}: ChatboxProps) {
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
        <div className="flex items-center justify-center mb-4 gap-4">
          <h1 className="text-2xl font-bold">{userToChat?.split(":")[1]}</h1>
          {userToChat && (
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  onlineStatus ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span>{onlineStatus ? "Online" : "Offline"}</span>
            </div>
          )}
        </div>
      </div>

      {userToChat && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded-md border-hover">
          {(messages[userToChat]?.messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.username === userToChat ? "justify-start" : "justify-end"
              }`}
            >
              <div
                key={index}
                className={`max-w-xs p-3 rounded-lg ${
                  msg.username === userToChat
                    ? "bg-gray-200"
                    : "bg-primary-light"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
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
