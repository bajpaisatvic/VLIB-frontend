import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage("New and confirm password do not match.");
      return;
    }

    try {
      await axios.post(
        `${backendURL}/users/update-password`,
        {
          oldPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword, // backend may validate again
        },
        { withCredentials: true }
      );
      setMessage("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || "Error updating password.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-red-600 rounded-xl p-6 max-w-md w-full space-y-4 animate-borderFlow"
      >
        <h3 className="text-xl font-semibold text-red-500 text-center mb-2">
          Change Password
        </h3>
        <Input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full">
          Update Password
        </Button>
        {message && (
          <p className="text-center text-sm text-red-400">{message}</p>
        )}
      </form>
      <style>{`
        @keyframes borderFlow {
          0% { border-top-color: red; border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
          25% { border-right-color: red; }
          50% { border-bottom-color: red; }
          75% { border-left-color: red; }
          100% { border-top-color: red; border-right-color: red; border-bottom-color: red; border-left-color: red; }
        }
        .animate-borderFlow {
          animation: borderFlow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
