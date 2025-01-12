// Import required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Create an Express application
const app = express();
// Create an HTTP server
const server = http.createServer(app);
// Set up Socket.IO with the HTTP server
const io = socketIo(server);

// Store rooms and their messages
const rooms = {}; 

// Handle socket connections
io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUsername = null; // Store the current user's username

    // Listen for a user joining a chat room
    socket.on("join_chat", ({ code, username }) => {
        currentRoom = code; // Set the current room to the unique code
        currentUsername = username; // Set the current user's username

        if (!rooms[code]) {
            rooms[code] = []; // Initialize the room if it doesn't exist
        }
        socket.join(code); // Join the specific room
        console.log(`${username} joined room: ${code}`);
    });

    // Listen for a user sending a message
    socket.on("send_message", ({ message }) => {
        if (currentRoom) {
            // Send the message to all clients in the room
            io.to(currentRoom).emit("receive_message", {
                sender: currentUsername || "User", // Use the stored username
                message,
            });
            rooms[currentRoom].push({ sender: currentUsername || "User", message }); // Store messages in the room
        }
    });

    // Handle user disconnecting
    socket.on("disconnect", () => {
        console.log(`${currentUsername} disconnected`);
    });
});

// Optional: Serve your frontend (if using in the same project)
// Uncomment the following line if you want to serve static files from the frontend build directory
// app.use(express.static(path.join(__dirname, 'frontend/build')));

// Optional: Define a health check route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
