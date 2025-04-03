import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL);

interface Message {
  message: string;
  username: string;
}

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("");
  const [userList, setUserList] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const join = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      setLoggedIn(true);
    }
  };

  const sendPrivateMessage = () => {
    if (selectedUser && message.trim()) {
      socket.emit("sendMessage", { targetUser: selectedUser, message });
      setMessage(""); // Clear input field
    }
  };

  useEffect(() => {
    socket.on("userList", (users: string[]) => {
      setUserList(users);
    });

    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log("Received message:", data);
    });

    return () => {
      socket.off("userList");
      socket.off("receiveMessage");
    };
  }, [username]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {!loggedIn ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={join}
            className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-700 mt-2"
          >
            Join
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold text-center mb-4">
            Private Chat
          </h1>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Connected Users</h2>
            <ul className="border rounded-lg p-2 bg-gray-100">
              {userList.map((user, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedUser(user)}
                  className={`cursor-pointer p-2 rounded ${
                    selectedUser === user ? "bg-blue-300" : "hover:bg-gray-200"
                  }`}
                >
                  {user == username ? user + " (You)" : user}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto p-4 border rounded-lg bg-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.username === username ? "bg-blue-300" : "bg-gray-200"
                }`}
              >
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <textarea
              placeholder="Type a private message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {selectedUser && (
              <button
                onClick={sendPrivateMessage}
                className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-700"
              >
                Send to {selectedUser}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
