const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = {}; // Store connected users

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    const { to, message } = data;
    console.log(`Message from ${socket.id} to ${to}: ${message}`);
    if (users[to]) {
      io.to(users[to]).emit("receive_message", {
        sender: socket.id,
        message,
      });
    }
  });

  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`${username} registered with ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from the list
    Object.keys(users).forEach((key) => {
      if (users[key] === socket.id) delete users[key];
    });
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
