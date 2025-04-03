import http from "http";
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

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
