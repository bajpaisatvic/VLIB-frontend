import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${backendURL}/users/history`, {
        withCredentials: true,
      });
      setHistory(res.data.data || []);
    } catch (err) {
      console.error(
        "Error fetching watch history:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-10">
        Loading watch history...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white py-10 px-6">
      <h2 className="text-3xl font-bold text-red-500 mb-8 text-center">
        Watch History
      </h2>

      {history.length === 0 ? (
        <p className="text-zinc-400 text-center">No watch history found.</p>
      ) : (
        <div className="space-y-6">
          {history.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              className="flex flex-col md:flex-row items-start bg-zinc-900 border border-red-600 rounded-lg overflow-hidden hover:bg-red-950 hover:scale-[1.01] transition-transform duration-300 shadow-md"
            >
              {/* Thumbnail */}
              <img
                src={video.thumbnail || "/placeholder-thumbnail.jpg"}
                alt={video.title}
                className="w-full md:w-60 h-40 md:h-36 object-cover"
              />

              {/* Details */}
              <div className="flex flex-col justify-between p-4 w-full">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {video.title}
                </h3>
                {/* <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                  {video.description}
                </p> */}
                <div className="flex items-center gap-3">
                  <img
                    src={video.owner?.avatar || "/default-avatar.png"}
                    alt="Uploader"
                    className="w-8 h-8 rounded-full object-cover border border-red-500"
                  />
                  <div>
                    <p className="text-sm text-red-400">
                      {video.owner?.fullname}
                    </p>
                    <p className="text-xs text-zinc-400">
                      @{video.owner?.username}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
