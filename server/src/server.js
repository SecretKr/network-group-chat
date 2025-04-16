import http from "http";
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json"));
import connectDB from "./database/db.js";
import auth from "./routes/auth.js";
import chat from "./routes/chat.js";
import Message from "./models/Message.js";
import message from './routes/message.js'; 
import Chat from "./models/Chat.js"; 
// D:\Third year of Engineering\Network\2\network-group-chat\server\src\models\Message.js

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const users = {};
const userIdBySocket ={};

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/v1/auth", auth);
app.use("/api/v1/chat", chat);
app.use("/api/v1/message", message);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Hello, World! Server is running 🚀");
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

function getSocketIdByUsername(username) {
  return Object.keys(users).find((key) => userIdBySocket[key] === username);
}
function getSocketIdByUserId(uid) {
  return Object.keys(users).find((key) => users[key] === uid);
}

function getUserList() {
  console.log("Users: ", users);
  return Object.values(users);
}

io.on("connection", (socket) => {
  console.log("A connection has been made");

  socket.on("setUsername", (data) => {
    const [uid, username] = data.split(":");
    const existingSocketId = getSocketIdByUserId(uid);

    if (existingSocketId) {
      delete users[existingSocketId];
      delete userIdBySocket[existingSocketId];
    }
    users[socket.id] = username;
    userIdBySocket[socket.id] = uid;
    console.log(`${uid} has joined.`);
    console.log(userIdBySocket);
    io.emit("userList", getUserList());
  });

  socket.on("sendMessage", async (data) => {
    const { chatId, text } = data;
    const senderId = userIdBySocket[socket.id];
    console.log("FF")
    console.log(chatId, text,senderId);
    if (!senderId || !chatId || !text) {
      console.error("❌ Missing required fields in message payload");
      return;
    }
  
    try {
      // Save message to DB
      const savedMessage = await Message.create({
        senderId,
        chatId,
        text,
      });
  
      // Get chat members from DB
      const chat = await Chat.findById(chatId).populate("users");
  
      if (!chat) {
        console.error("❌ Chat not found for chatId:", chatId);
        return;
      }
  
      // Emit message to all members in chat
      for (const user of chat.users) {
        const targetSocketId = socketIdByUserId[user._id.toString()];
        if (targetSocketId) {
          io.to(targetSocketId).emit("receiveMessage", {
            text,
            senderId,
            chatId,
            createdAt: savedMessage.createdAt,
          });
        }
      }
  
      // Optionally emit back to sender (in case they aren't in the user list)
      socket.emit("receiveMessage", {
        text,
        senderId,
        chatId,
        createdAt: savedMessage.createdAt,
      });
    } catch (err) {
      console.error("❌ Error saving or emitting message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} has disconnected.`);
    delete users[socket.id];
    io.emit("userList", getUserList());
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
