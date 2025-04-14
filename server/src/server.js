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
import message from "./routes/message.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
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

let users = {};

function getSocketIdByUsername(username) {
  return Object.keys(users).find((key) => users[key] === username);
}

function getUserList() {
  return Object.values(users);
}

io.on("connection", (socket) => {
  console.log("A connection has been made");

  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    console.log(`${username} has joined.`);
    io.emit("userList", getUserList());
  });

  socket.on("sendMessage", (data) => {
    const { targetUser, message } = data;
    const targetSocketId = getSocketIdByUsername(targetUser);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receiveMessage", {
        username: users[socket.id],
        message,
      });
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
