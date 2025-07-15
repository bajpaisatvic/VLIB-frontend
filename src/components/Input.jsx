// Input.jsx
import React from "react";

const Input = ({
  type,
  name,
  placeholder,
  className,
  required,
  accept,
  onChange,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
      accept={accept}
      onChange={onChange}
      className={`w-full p-2 rounded-md outline-none focus:ring-2 focus:ring-red-600 bg-black border border-zinc-700 text-white ${className}`}
    />
  );
};

export default Input;
