import React from "react";
import "./Loading_Screen.css"; // Import CSS for styling (optional)

interface LoadingScreenProps {
  message?: string; // Optional loading message
}

const Loading_Screen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading_Screen;
