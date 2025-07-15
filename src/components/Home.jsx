import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Duration formatter: seconds → "mm:ss"
const formatDuration = (seconds) => {
  const totalSeconds = Math.round(seconds); // 🔁 Round to nearest integer
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendURL}/video/?page=${page}&limit=${limit}&query=&sortBy=createdAt&sortType=desc`,
        { withCredentials: true }
      );
      setVideos(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 1) / limit));
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-red-500">Latest Videos</h1>

      {loading ? (
        <div className="text-center text-red-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              to={`/watch/${video._id}`}
              key={video._id}
              className="bg-zinc-900 rounded-lg overflow-hidden border border-red-600 hover:scale-105 transition-transform duration-300 shadow-md"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-md font-semibold text-red-500 line-clamp-2">
                  {video.title}
                </h3>
                {/* <p className="text-sm text-zinc-400 line-clamp-2">
                  {video.description}
                </p> */}
                <div className="flex items-center gap-2 mt-3">
                  <img
                    src={video.video_owner?.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-white">
                    {video.video_owner?.username}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-10 space-x-2">
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border border-red-500 ${
              p === page ? "bg-red-600 text-white" : "bg-black text-red-500"
            } hover:bg-red-700 hover:text-white transition`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
