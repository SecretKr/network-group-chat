import http from "http";
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

import connectDB from "./database/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";

import MessageModel from "./models/Message.js";
import ChatModel from "./models/Chat.js";

dotenv.config();
connectDB();

const swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json"));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Socket tracking maps
const socketIdToUsername = {};
const socketIdToUserId = {};

// Middleware & Routes
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Hello, World! Server is running 🚀");
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Helper functions
function getSocketIdByUserId(userId) {
  return Object.keys(socketIdToUserId).find(socketId => socketIdToUserId[socketId] === userId);
}

function getOnlineUserList() {
  return Object.values(socketIdToUsername);
}

// Socket events
io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);

  socket.on("setUsername", (data) => {
    const [userId, username] = data.split(":");
    const existingSocketId = getSocketIdByUserId(userId);

    if (existingSocketId) {
      delete socketIdToUsername[existingSocketId];
      delete socketIdToUserId[existingSocketId];
    }

    socketIdToUsername[socket.id] = username;
    socketIdToUserId[socket.id] = userId;

    console.log(`👤 User ${userId} (${username}) connected.`);
    io.emit("userList", getOnlineUserList());
  });

  socket.on("sendMessage", async (data) => {
    let { chatId, text } = data;
    text += "socket";
    const senderId = socketIdToUserId[socket.id];
    console.log(senderId, chatId, text);
    if (!senderId || !chatId || !text) {
      console.error("❌ Missing required fields in message payload");
      return;
    }

    try {
      // Save message to DB
      const savedMessage = await MessageModel.create({
        senderId,
        chatId,
        text,
      });

      // Get chat members from DB
      const chat = await ChatModel.findById(chatId).populate("users");
      if (!chat) {
        console.error("❌ Chat not found for chatId:", chatId);
        return;
      }

      // Emit message to all members
      for (const user of chat.users) {
        const targetSocketId = getSocketIdByUserId(user._id.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit("receiveMessage", {
            text,
            senderId,
            chatId,
            createdAt: savedMessage.createdAt,
          });
        }
      }

      // Emit back to sender just in case
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
    console.log(`❌ Disconnected: ${socketIdToUsername[socket.id]}`);
    delete socketIdToUsername[socket.id];
    delete socketIdToUserId[socket.id];
    io.emit("userList", getOnlineUserList());
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
