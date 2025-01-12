import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust to your backend URL

function App() {
  const [username, setUsername] = useState(""); // Only username is needed to join
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [roomCode, setRoomCode] = useState(""); // State to hold the room code

  useEffect(() => {
    // Log when connected
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    // Listen for the room code from the server
    socket.on("room_code", (code) => {
      setRoomCode(code); // Set the room code from the server
      console.log("Joined room with code:", code);
    });

    // Listen for messages from the server
    socket.on("receive_message", (data) => {
      console.log("Received message:", data); // Log received message
      setChatHistory((prev) => [...prev, { sender: data.sender, text: data.message }]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("room_code");
    };
  }, []);

  const joinChat = () => {
    if (username.trim() !== "") {
      socket.emit("join_chat", { username }); // Send join request with username
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { message }); // Send message with the username
      setChatHistory((prev) => [...prev, { sender: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>TenTen Chat App</h1>
      {!isJoined ? (
        <div>
          <h3>Join Chat Room</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h3>Chat Room (Code: {roomCode})</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              height: "200px",
              overflowY: "scroll",
            }}
          >
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <strong>{chat.sender}:</strong> {chat.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ width: "80%" }}
          />
          <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
