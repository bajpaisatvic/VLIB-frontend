import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { cn } from "./utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const { loading } = useAuth(); // fetches checkAuth on mount already
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const toggleCard = () => {
    setIsLogin(!isLogin);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLogin = async () => {
    try {
      setLoadingAction(true);
      const res = await axios.post(
        `${backendURL}/users/login`,
        {
          username: formData.username,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Login success:", res.data);
      setLoadingAction(false);
      window.location.reload(); // This reloads & triggers AuthContext's fetchCurrentUser()
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleRegister = async () => {
    try {
      setLoadingAction(true);
      const payload = new FormData();
      for (const key in formData) {
        payload.append(key, formData[key]);
      }

      await axios.post(`${backendURL}/users/register`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage("Account created successfully. Please log in.");
      setLoadingAction(false);
      setIsLogin(true);
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      setMessage(
        err.response?.data?.message || "Something went wrong during signup"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="relative group w-full max-w-md rounded-2xl transition-transform duration-300 hover:scale-105">
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="w-full h-full animate-borderFlow rounded-2xl border-2 border-transparent group-hover:border-red-600"></div>
        </div>

        <div className="relative z-10 bg-zinc-900 text-white p-8 rounded-2xl border border-red-700 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Welcome Back" : "Register Your Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  required
                  onChange={handleChange}
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  onChange={handleChange}
                />
              </>
            )}

            <Input
              type="text"
              name="username"
              placeholder="Username"
              required
              onChange={handleChange}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
            />

            {!isLogin && (
              <>
                <label className="block text-sm text-gray-400">
                  Avatar (required)
                </label>
                <Input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  required
                  onChange={handleChange}
                />
                <label className="block text-sm text-gray-400">
                  Cover Image (optional)
                </label>
                <Input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleChange}
                />
              </>
            )}

            <Button
              type="submit"
              disabled={loadingAction}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              {loadingAction ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            {isLogin
              ? "If you are new to our website please "
              : "Already have an account? "}
            <span
              onClick={toggleCard}
              className="text-red-500 hover:underline cursor-pointer"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>

          {message && (
            <p className="text-center text-sm mt-2 text-red-400">{message}</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes borderFlow {
          0% { border-top-color: red; border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
          25% { border-right-color: red; }
          50% { border-bottom-color: red; }
          75% { border-left-color: red; }
          100% { border-top-color: red; border-right-color: red; border-bottom-color: red; border-left-color: red; }
        }
        .animate-borderFlow {
          animation: borderFlow 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
