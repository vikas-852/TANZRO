import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Change to your backend URL on Render

function App() {
  const [friends, setFriends] = useState(["Alice", "Bob", "Charlie"]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Receive messages from the server
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, { sender: data.sender, text: data.message }]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (activeFriend && message.trim() !== "") {
      socket.emit("send_message", { to: activeFriend, message });
      setChatHistory((prev) => [...prev, { sender: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>TenTen Chat App</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h3>Friends List</h3>
          <ul>
            {friends.map((friend, index) => (
              <li
                key={index}
                style={{
                  cursor: "pointer",
                  fontWeight: activeFriend === friend ? "bold" : "normal",
                }}
                onClick={() => setActiveFriend(friend)}
              >
                {friend}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          {activeFriend ? (
            <>
              <h3>Chat with {activeFriend}</h3>
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
            </>
          ) : (
            <p>Select a friend to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
            
