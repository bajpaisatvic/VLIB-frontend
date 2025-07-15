import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaVideo, FaEye, FaHeart, FaUsers } from "react-icons/fa";

export default function ChannelDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendURL}/dashboard/stats`, {
          withCredentials: true,
        });
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load channel stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <h1 className="text-3xl font-bold text-red-500 text-center mb-8">
        Channel Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <StatCard
          icon={<FaVideo />}
          label="Total Videos"
          value={stats.totalVideos}
        />
        <StatCard
          icon={<FaEye />}
          label="Total Views"
          value={stats.totalViews}
        />
        <StatCard
          icon={<FaHeart />}
          label="Total Likes"
          value={stats.totalLikes}
        />
        <StatCard
          icon={<FaUsers />}
          label="Subscribers"
          value={stats.totalSubscribers}
        />
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

function StatCard({ icon, label, value }) {
  return (
    <div className="relative p-6 bg-zinc-900 rounded-xl border border-red-600 text-center hover:scale-105 transition-transform duration-300 shadow-md z-10 before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-transparent before:animate-borderFlow">
      <div className="text-red-500 text-3xl mb-3">{icon}</div>
      <h2 className="text-lg font-medium text-zinc-300">{label}</h2>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
