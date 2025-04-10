import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";

interface Message {
  message: string;
  username: string;
}

const Chat = () => {
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("");
  const [userList, setUserList] = useState<string[]>([]);
  const [userToChat, setUserToChat] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const join = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      setLoggedIn(true);
    }
  };

  // const sendPrivateMessage = () => {
  //   if (userToChat && message.trim()) {
  //     socket.emit("sendMessage", { targetUser: userToChat, message });
  //     setMessage("");
  //   }
  // };

  const sendPrivateMessage = () => {
    if (userToChat && message.trim()) {
      const newMessage = {
        username,
        message,
      };

      // Send to server
      socket.emit("sendMessage", {
        targetUser: userToChat,
        message,
      });

      // Update local messages
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Clear input
      setMessage("");
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
  }, [socket]);

  useEffect(() => {
    // Simulate connected users (excluding self)
    const mockUsers = ["Wit", "Mio", "Touch", "Mes"];
    setUserList([username, ...mockUsers]);

    // Simulate message history
    const mockMessages: Message[] = [
      { username: "Wit", message: "Hi! How are you?" },
      { username: "Mio", message: "Hi! How are you?" },
      { username: "Touch", message: "Hi! How are you?" },
      { username: "Mes", message: "Hi! How are you?" },
      { username: username, message: "I’m good, thanks!" },
      { username: "Wit", message: "Are you joining the meeting later?" },
      { username: "Mio", message: "Are you joining the meeting later?" },
      { username: "Touch", message: "Are you joining the meeting later?" },
      { username: "Mes", message: "Are you joining the meeting later?" },
      { username: username, message: "Yes, I’ll be there!" },
      { username: "Wit", message: "Lunch?" },
      { username: "Mio", message: "Lunch?" },
      { username: "Touch", message: "Lunch?" },
      { username: "Mes", message: "Lunch?" },
      { username: username, message: "Sure, let’s go!" },
    ];
    setMessages(mockMessages);
  }, [username]);

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
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
    );
  }

  return (
    <div className="w-screen h-screen flex bg-gray-100">
      {/* Sidebar - User List */}
      <div className="w-1/4 border-r border-gray-300 bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Connected Users</h2>
        <ul className="space-y-2">
          {userList
            .filter((user) => user !== username)
            .map((user, index) => (
              <li
                key={index}
                onClick={() => {
                  setUserToChat(user);
                  setSelectedUser(true);
                }}
                className={`cursor-pointer p-2 rounded-lg ${
                  userToChat === user ? "bg-blue-300" : "hover:bg-gray-200"
                }`}
              >
                {user === username ? `${user} (You)` : user}
              </li>
            ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-4">
          Chat with {userToChat || "..."}
        </h1>

        {/* Message History */}
        {selectedUser ? (
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded shadow-inner">
            {messages
              .filter(
                (msg) =>
                  msg.username === userToChat || msg.username === username
              )
              .map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.username === username
                      ? "bg-blue-300 self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  <strong>
                    {msg.username === username ? "You" : msg.username}:
                  </strong>{" "}
                  {msg.message}
                </div>
              ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white p-4 border rounded shadow-inner"></div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
          />
          <button
            onClick={sendPrivateMessage}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            disabled={!userToChat}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
