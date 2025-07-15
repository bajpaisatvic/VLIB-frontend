// components/PlaylistCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEllipsisV } from "react-icons/fa";

export default function PlaylistCard({
  playlist,
  currentUser,
  onEditClick,
  onDeleteClick,
  activeMenuId,
  setActiveMenuId,
}) {
  const isOwner =
    playlist.owner?.id?.toString() === currentUser._id?.toString();

  const toggleMenu = () =>
    setActiveMenuId((prev) => (prev === playlist._id ? null : playlist._id));

  return (
    <div className="bg-zinc-900 border border-red-600 rounded-lg p-4 shadow-md relative hover:scale-[1.02] transition-transform overflow-visible">
      <div className="flex justify-between items-start">
        <div>
          <Link to={`/playlist/${playlist._id}`}>
            <h3 className="text-lg font-semibold text-red-500 hover:underline">
              {playlist.title}
            </h3>
          </Link>
          <p className="text-sm text-zinc-400">
            {playlist.description.slice(0, 15)}...
          </p>
          <div className="flex items-center gap-2 mt-1">
            <img
              src={playlist.owner?.avatar}
              alt="owner"
              className="w-8 h-8 rounded-full border border-red-500 object-cover"
            />
            <div className="text-sm text-zinc-300">
              <p>{playlist.owner?.fullname}</p>
              <p className="text-xs text-zinc-500">
                @{playlist.owner?.username}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {playlist.playlistVideos.length} videos
          </p>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              className="text-white hover:text-zinc-300"
              onClick={toggleMenu}
            >
              <FaEllipsisV />
            </button>

            {activeMenuId === playlist._id && (
              <div className="absolute right-0 mt-2 w-32 bg-zinc-800 rounded shadow-lg border border-zinc-600 z-10">
                <button
                  onClick={() => onEditClick(playlist)}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteClick(playlist)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* {playlist.playlistVideos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {playlist.playlistVideos.slice(0, 3).map((video, idx) => (
            <img
              key={idx}
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-20 object-cover rounded"
            />
          ))}
        </div>
      )} */}
    </div>
  );
}
