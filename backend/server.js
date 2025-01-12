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

// Function to generate a unique code
function generateUniqueCode(length = 6) {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase(); // Generate a random alphanumeric string
}

// Handle socket connections
io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUsername = null; // Store the current user's username

    // Listen for a user joining a chat room
    socket.on("join_chat", ({ username }) => {
        // Generate a unique room code for the new chat
        const code = generateUniqueCode();
        currentRoom = code; // Set the current room to the unique code
        currentUsername = username; // Set the current user's username

        if (!rooms[code]) {
            rooms[code] = []; // Initialize the room if it doesn't exist
        }
        socket.join(code); // Join the specific room
        console.log(`${username} joined room: ${code}`);

        // Send the unique code back to the client
        socket.emit("room_code", code); // Emit the code back to the client
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

// Optional: Define a health check route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
