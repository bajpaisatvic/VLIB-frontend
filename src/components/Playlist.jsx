import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import PlaylistCard from "./Utils/PlaylistCard";
import { FaPlus, FaEllipsisV } from "react-icons/fa";

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editData, setEditData] = useState(null);
  const backendURL = import.meta.env.VITE_DEV_BACKEND_URL;
  const confirmDeletePlaylist = async () => {
    try {
      await axios.delete(`${backendURL}/playlist/${confirmDelete._id}`, {
        withCredentials: true,
      });
      setConfirmDelete(null);
      fetchPlaylists();
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  };
  const submitEditPlaylist = async () => {
    try {
      await axios.patch(
        `${backendURL}/playlist/${editData._id}`,
        { name: editData.title, description: editData.description },
        { withCredentials: true }
      );
      setEditData(null);
      fetchPlaylists();
    } catch (err) {
      console.error("Failed to edit playlist:", err);
    }
  };
  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${backendURL}/playlist/user/${user._id}`, {
        withCredentials: true,
      });
      setPlaylists(
        Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      );
    } catch (err) {
      console.error("Failed to load playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    try {
      await axios.post(
        `${backendURL}/playlist/`,
        { name: newTitle, description: newDesc },
        { withCredentials: true }
      );
      setNewTitle("");
      setNewDesc("");
      fetchPlaylists();
    } catch (err) {
      console.error("Error creating playlist:", err.response?.data);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;
    try {
      await axios.delete(`${backendURL}/playlist/${id}`, {
        withCredentials: true,
      });
      fetchPlaylists();
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  };

  const handleEditPlaylist = async (id, title, description) => {
    try {
      await axios.patch(
        `${backendURL}/playlist/${id}`,
        { name: title, description },
        { withCredentials: true }
      );
      fetchPlaylists();
    } catch (err) {
      console.error("Failed to edit playlist:", err);
    }
  };

  useEffect(() => {
    if (user?._id) fetchPlaylists();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
        Your Playlists
      </h2>

      {/* Create Playlist */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Playlist Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-zinc-800 px-4 py-2 rounded border border-zinc-700"
          />
          <input
            type="text"
            placeholder="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="flex-1 bg-zinc-800 px-4 py-2 rounded border border-zinc-700"
          />
          <button
            onClick={handleCreatePlaylist}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white flex items-center gap-2"
          >
            <FaPlus /> Create
          </button>
        </div>
      </div>

      {/* Playlist Cards */}
      {loading ? (
        <p className="text-zinc-400 text-center">Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <p className="text-zinc-400 text-center">No playlists yet.</p>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              currentUser={user}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onDeleteClick={(pl) => setConfirmDelete(pl)}
              onEditClick={(pl) =>
                setEditData({
                  _id: pl._id,
                  title: pl.title,
                  description: pl.description,
                })
              }
            />
          ))}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
              <div className="bg-zinc-900 border border-red-600 p-6 rounded max-w-sm text-center text-white">
                <p className="text-lg mb-4">
                  Are you sure you want to delete the playlist{" "}
                  <span className="text-red-400">{confirmDelete.title}</span>?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmDeletePlaylist}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {editData && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
              <div className="bg-zinc-900 border border-red-600 p-6 rounded max-w-md w-full text-white">
                <h3 className="text-xl font-bold text-red-500 mb-4">
                  Edit Playlist
                </h3>
                <input
                  type="text"
                  className="w-full bg-zinc-800 px-4 py-2 mb-2 rounded border border-zinc-700"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <input
                  type="text"
                  className="w-full bg-zinc-800 px-4 py-2 mb-4 rounded border border-zinc-700"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <div className="flex justify-between">
                  <button
                    onClick={submitEditPlaylist}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditData(null)}
                    className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
