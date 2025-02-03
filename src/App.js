import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { FaPaperPlane } from "react-icons/fa";

// Connect to the socket.io server
const socket = io("http://localhost:4000");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    // Handle incoming messages from backend
    const handleMessage = (message) => {
      console.log("Message received from server:", message);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };

    // Listen for chat history (optional)
    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  // Scroll to the latest message
  const scrollToBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const joinChat = () => {
    if (username.trim() !== "") {
      socket.emit("join", username); // Emit the join event to the backend
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (input.trim() !== "") {
      const message = { username, message: input, timestamp: new Date() };
      socket.emit("message", message); // Emit the message event to the backend
      setInput(""); // Clear the input field after sending the message
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800 p-4">
      {!joined ? (
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Join Chat</h2>
          <input
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="w-full mt-4 bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition duration-300 font-semibold"
            onClick={joinChat}
          >
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg flex flex-col h-[90vh] overflow-hidden">
          <div className="bg-green-600 text-white p-4 text-lg font-semibold text-center">
            🟢 Online | Thrifty AI Chat
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {messages
              .slice()
              .reverse()
              .map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.username === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative p-4 rounded-lg shadow-md text-sm max-w-3xl w-full ${
                      msg.username === username
                        ? "bg-green-500 text-white self-end rounded-br-none"
                        : msg.username === "Bot"
                        ? "bg-gray-500 text-white self-start rounded-bl-none"
                        : "bg-gray-700 text-white self-start rounded-bl-none"
                    }`}
                  >
                    {msg.username !== username && (
                      <div className="text-xs font-semibold text-gray-300 mb-1">
                        {msg.username}
                      </div>
                    )}
                    <div>{msg.message}</div>
                    <div className="absolute bottom-1 right-2 text-xs text-gray-300">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            <div ref={chatRef}></div>
          </div>

          <div className="p-4 bg-gray-900 flex items-center">
            <input
              className="flex-1 p-4 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="ml-3 bg-green-500 p-4 rounded-full text-white hover:bg-green-600 transition duration-300 flex items-center"
              onClick={sendMessage}
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;