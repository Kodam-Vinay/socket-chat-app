import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors({ origin: true }));
const io = new Server({ cors: "http://localhost:3000" });
const PORT = process.env.PORT || 8000;
let onlineUsers = [];

io.on("connection", (socket) => {
  //online users
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    io.emit("getOnlineUsers", onlineUsers);
  });

  //send message
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user?.userId === message?.recipientId
    );

    user && io.to(user.socketId).emit("getMessage", message);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user?.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

io.listen(PORT);
