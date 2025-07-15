import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { FaUser } from "react-icons/fa";

export default function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const fetchSubscribed = async () => {
    try {
      const res = await axios.get(`${backendURL}/subscription/u/${user._id}`, {
        withCredentials: true,
      });
      setChannels(res.data.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch subscribed channels:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };
  const handleUnsubscribe = async (channelId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/subscription/c/${channelId}`,
        {},
        { withCredentials: true }
      );
      // Remove from UI
      setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
    } catch (err) {
      console.error("Unsubscribe failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (user?._id) fetchSubscribed();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-red-500  text-center mt-10">
        Loading...
      </div>
    );

  if (!channels.length)
    return (
      <div className="min-h-screen bg-black text-red-500  text-center">
        You haven’t subscribed to any channels yet.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-red-500 mb-8 text-center">
        Subscribed Channels
      </h2>

      <div className="space-y-4 max-w-3xl mx-auto">
        {channels.map((ch, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-zinc-900 border border-red-600 rounded-lg p-4 hover:bg-zinc-800 transition"
          >
            <div className="flex items-center gap-4">
              {ch.avatar ? (
                <img
                  src={ch.avatar}
                  alt={ch.fullname}
                  className="w-14 h-14 rounded-full object-cover border border-red-500"
                />
              ) : (
                <FaUser className="w-14 h-14 text-red-500 border border-red-500 rounded-full p-2" />
              )}
              <div>
                <Link
                  to={`/channel/${ch.username}`}
                  className="text-lg font-semibold text-white hover:underline"
                >
                  {ch.fullname}
                </Link>
                <p className="text-sm text-zinc-400">@{ch.username}</p>
              </div>
            </div>
            <button
              onClick={() => handleUnsubscribe(ch.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Unsubscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
