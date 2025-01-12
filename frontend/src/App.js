import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust to your backend URL

function App() {
  const [code, setCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Listen for messages from the server
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, { sender: data.sender, text: data.message }]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const joinChat = () => {
    if (code.trim() !== "") {
      socket.emit("join_chat", { code }); // Send join request to server
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { message, code }); // Send message with the code
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
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter unique code"
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h3>Chat Room (Code: {code})</h3>
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
