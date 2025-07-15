// components/PlaylistPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function PlaylistPage() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const formatDuration = (seconds) => {
    const totalSeconds = Math.round(seconds); // 🔁 Round to nearest integer
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  const fetchPlaylist = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/playlist/${playlistId}`, {
        withCredentials: true,
      });
      setPlaylist(data.data);
    } catch (err) {
      console.error("Failed to fetch playlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  if (loading)
    return <div className="text-white text-center py-10">Loading...</div>;

  if (!playlist)
    return (
      <div className="text-red-500 text-center py-10">Playlist not found</div>
    );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Title and Description */}
        <h2 className="text-3xl font-bold text-red-500 mb-2">
          {playlist.title}
        </h2>
        <p className="text-zinc-300 mb-4">{playlist.description}</p>

        {/* Owner Info */}
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-700 pb-4">
          <img
            src={playlist.owner.avatar}
            alt="owner"
            className="w-10 h-10 rounded-full border border-red-500 object-cover"
          />
          <div>
            <p className="text-white font-semibold">
              {playlist.owner.fullname}
            </p>
            <p className="text-sm text-zinc-400">@{playlist.owner.username}</p>
          </div>
          <span className="ml-auto text-sm text-zinc-500">
            {playlist.playlistVideos.length} video
            {playlist.playlistVideos.length !== 1 && "s"}
          </span>
        </div>

        {/* Video List */}
        {playlist.playlistVideos.length === 0 ? (
          <p className="text-zinc-400 text-center">
            No videos in this playlist.
          </p>
        ) : (
          <div className="grid md:grid-cols-1 gap-6">
            {playlist.playlistVideos.map((video, idx) => (
              <Link
                key={idx}
                to={`/watch/${video.id}`}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded p-3 flex gap-4"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex flex-col justify-between">
                  <h4 className="text-white font-semibold line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Duration: {formatDuration(video.duration) || "Unknown"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
