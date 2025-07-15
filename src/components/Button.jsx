// Button.jsx
import React from "react";

const Button = ({ type = "button", className, children, onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-semibold transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
