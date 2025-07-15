import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import Input from "./Input";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHistory,
  FaTv,
  FaChartBar,
  FaCamera,
  FaLock,
  FaUserCircle,
} from "react-icons/fa";

export default function ProfileDashboard() {
  const { user, loading, fetchCurrentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendURL}/users/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    }
  };
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "avatar") setAvatarFile(files[0]);
      else if (name === "coverImage") setCoverFile(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);
      const promises = [];

      promises.push(
        axios.patch(
          `${backendURL}/users/update-details`,
          {
            fullname: formData.fullname,
            email: formData.email,
          },
          { withCredentials: true }
        )
      );

      if (avatarFile) {
        const avatarData = new FormData();
        avatarData.append("avatar", avatarFile);
        promises.push(
          axios.patch(`${backendURL}/users/update-avatar`, avatarData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          })
        );
      }

      if (coverFile) {
        const coverData = new FormData();
        coverData.append("coverImage", coverFile);
        promises.push(
          axios.patch(`${backendURL}/users/update-cover`, coverData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          })
        );
      }

      await Promise.all(promises);
      await fetchCurrentUser(); // 🔄 Reflect updates instantly

      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      setMessage("Profile updated successfully.");
      setEditMode(false);
      setSaving(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Something went wrong.");
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setAvatarPreview(null);
    setCoverPreview(null);
  };

  const handleCoverClick = () => {
    document.getElementById("coverInput")?.click();
  };

  const handleUpdateCover = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      await axios.patch(`${backendURL}/users/update-cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      await fetchCurrentUser();
      setMessage("Cover image updated successfully.");
    } catch (err) {
      console.error("Cover update error:", err);
      setMessage("Failed to update cover image.");
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  if (editMode) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-red-600 rounded-xl p-6 max-w-xl w-full space-y-4 animate-borderFlow hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-red-500 text-center">
            Edit Your Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400">Avatar</label>
              <Input
                type="file"
                name="avatar"
                onChange={(e) => {
                  handleChange(e);
                  const file = e.target.files[0];
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                }}
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="mt-2 w-16 h-16 rounded-full border border-red-500 object-cover"
                />
              )}
            </div>
            <div>
              <label className="text-sm text-zinc-400">Cover Image</label>
              <Input
                type="file"
                name="coverImage"
                onChange={(e) => {
                  handleChange(e);
                  const file = e.target.files[0];
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
              />
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="mt-2 w-full h-24 object-cover rounded-lg border border-red-500"
                />
              )}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleSaveAllChanges}
              className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              onClick={handleCancelEdit}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
          {message && (
            <p className="text-center text-red-400 text-sm">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cover Image Section */}
      <div
        className="relative w-full h-64 bg-zinc-800 flex items-center justify-center cursor-pointer group"
        onClick={user?.coverimage ? "" : handleCoverClick}
      >
        {user?.coverimage ? (
          <img
            src={user.coverimage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FaCamera className="text-3xl text-red-600 mb-2" />
            <p className="text-red-500">No Cover Image</p>
            <p className="text-sm text-zinc-400">Click to upload one</p>
          </div>
        )}
        <input
          type="file"
          id="coverInput"
          name="coverImage"
          accept="image/*"
          onChange={(e) => handleUpdateCover(e.target.files[0])}
          className="hidden"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-1 mt-5 mr-10">
          <button
            onClick={() => setEditMode(true)}
            className="w-full text-left"
          >
            <div className="flex flex-col items-center bg-zinc-900 border border-red-600 rounded-xl p-4 hover:scale-105 transition-transform duration-300 relative z-10 before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-transparent before:animate-borderFlow">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-red-500 mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-1">{user.fullname}</h2>
              <p className="text-zinc-400">@{user.username}</p>
              <p className="text-zinc-400 text-sm mb-4">{user.email}</p>
              <span className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                Edit Profile
              </span>
            </div>
          </button>
          <Link
            to="/change-password"
            className="mt-4 flex items-center justify-center gap-2 bg-zinc-900 border border-red-600 rounded-xl p-3 w-full hover:scale-105 hover:bg-red-950 transition-transform duration-300 shadow-md"
          >
            <FaLock className="text-red-500 text-xl" />
            <span className="text-white text-sm font-medium">
              Change Password
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 bg-zinc-900 border border-red-600 rounded-xl p-3 w-full hover:scale-105 hover:bg-red-950 transition-transform duration-300 shadow-md"
          >
            <FaUserCircle className="text-red-500 text-xl" />
            <span className="text-white text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Right Options */}
        <div className="ml-10 mt-10 col-span-3 space-y-4">
          <Link
            to="/channel-dashboard"
            className="flex items-center gap-3 w-full bg-zinc-900 border border-red-600 p-4 rounded-xl hover:scale-105 hover:bg-red-950 transition-transform duration-300 shadow-md"
          >
            <FaChartBar className="text-xl text-red-500" />
            <span className="text-lg">Channel Dashboard</span>
          </Link>
          <Link
            to="/watch-history"
            className="flex items-center gap-3 w-full bg-zinc-900 border border-red-600 p-4 rounded-xl hover:scale-105 hover:bg-red-950 transition-transform duration-300 shadow-md"
          >
            <FaHistory className="text-xl text-red-500" />
            <span className="text-lg">Watch History</span>
          </Link>
          <Link
            to={`/channel/${user.username}`}
            className="flex items-center gap-3 w-full bg-zinc-900 border border-red-600 p-4 rounded-xl hover:scale-105 hover:bg-red-950 transition-transform duration-300 shadow-md"
          >
            <FaTv className="text-xl text-red-500" />
            <span className="text-lg">Your Channel</span>
          </Link>
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
          animation: borderFlow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
