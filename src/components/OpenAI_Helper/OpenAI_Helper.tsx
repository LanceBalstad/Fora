import React, { useState } from "react";
import axios from "axios";
import "./OpenAI_Helper.css";

interface Message {
  user: string;
  message: string;
}

const OpenAI_Helper = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = import.meta.env.VITE_API_KEY;

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { user: "You", message: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant and your name is Gabby.",
        },
        { role: "user", content: userInput },
      ],
    };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const botMessage = response.data.choices[0].message.content;
      setMessages([
        ...newMessages,
        { user: "AI Assistant", message: botMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          user: "AI Assistant",
          message: "Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="user">{msg.user}:</span>
            <span className="text">{msg.message}</span>
          </div>
        ))}
        {isLoading && <div className="loading">AI Assistant is typing...</div>}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your question..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default OpenAI_Helper;
