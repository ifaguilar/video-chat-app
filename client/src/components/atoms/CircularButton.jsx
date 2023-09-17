import React from "react";

const CircularButton = ({
  className = "",
  type = "button",
  onClick = () => null,
  children,
}) => {
  return (
    <button
      className={`rounded-full py-3 px-6 font-bold bg-neutral-900 hover:bg-neutral-800 transition ${className}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CircularButton;
