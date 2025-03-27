import React, { useState } from "react";
import axios from "axios";
import "./OpenAI_Helper.css";

interface Message {
  user: string;
  message: string;
}

interface OpenAI_HelperProps {
  productList: any[];
  columns: string[];
}

const OpenAI_Helper: React.FC<OpenAI_HelperProps> = ({
  productList,
  columns,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAI, setShowAI] = useState(true); // State to control AI visibility

  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = import.meta.env.VITE_API_KEY;

  const getProductContext = () => {
    if (!productList.length) {
      return "The user has no products in their inventory.";
    }

    return `The user has the following products:\n${productList
      .map((product) =>
        columns.map((col) => `${col}: ${product[col]}`).join(", ")
      )
      .join("\n")}`;
  };

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
          content: `You are a helpful assistant named Gabby. The user manages a product inventory.
                    The product list contains the following columns: ${columns.join(
                      ", "
                    )}.
                    ${getProductContext()} Use this information to help the user with product-related queries.`,
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

  const toggleAI = () => {
    setShowAI(!showAI); // Toggle AI visibility
  };

  return (
    <div className="chatbot-container">
      {showAI && (
        <div className="chatbox">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <span className="user">{msg.user}:</span>
              <span className="text">{msg.message}</span>
            </div>
          ))}
          {isLoading && (
            <div className="loading">AI Assistant is typing...</div>
          )}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask AI about your table..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>

        <button className="circular-btn" onClick={toggleAI}>
          {showAI ? "Hide Chat" : "Show Chat"}
        </button>
      </div>
    </div>
  );
};

export default OpenAI_Helper;
