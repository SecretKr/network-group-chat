import { Icon } from "@iconify/react";
import { MessageMap } from "../Chat";

interface ChatboxProps {
  userToChat: string | null;
  messages: MessageMap;
  setMessage: (message: string) => void;
  message: string;
  sendPrivateMessage: () => void;
}

export function Chatbox({
  userToChat,
  messages,
  setMessage,
  message,
  sendPrivateMessage,
}: ChatboxProps) {
  return (
    <div className="flex-1 flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">{userToChat}</h1>

      {userToChat && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded shadow-inner">
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
                  msg.username === userToChat ? "bg-gray-200" : "bg-blue-300"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex h-12 gap-2">
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
          className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
        />
        <button
          onClick={sendPrivateMessage}
          className="bg-purple-500 text-white px-4 py-4 rounded-md hover:bg-purple-700"
        >
          <Icon icon="mdi:send" width={17} height={17} />
        </button>
      </div>
    </div>
  );
}
