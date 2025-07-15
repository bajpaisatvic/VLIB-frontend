import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CustomVideoPlayer from "./Utils/Custom_video_player";
import {
  FaEye,
  FaHeart,
  FaUserPlus,
  FaCheck,
  FaThumbsUp,
  FaTrash,
  FaEdit,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

export default function VideoPlayer() {
  const calledRef = useRef(false);
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsWithVideo, setPlaylistsWithVideo] = useState(new Set());
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const { user } = useAuth();

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${backendURL}/playlist/user/${user._id}`, {
        withCredentials: true,
      });

      const list = Array.isArray(res.data.data)
        ? res.data.data
        : [res.data.data];

      setPlaylists(list);

      // Create Set of playlist IDs where video is already present
      const set = new Set();
      list.forEach((pl) => {
        if (pl.playlistVideos?.some((v) => v.videofile === video.videofile)) {
          set.add(pl._id);
        }
      });
      setPlaylistsWithVideo(set);
    } catch (err) {
      console.error("Error fetching playlists:", err.message);
    }
  };
  const fetchComments = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/comment/${videoId}?page=1&limit=10`,
        { withCredentials: true }
      );
      setComments(data.data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };
  const fetchVideo = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/video/${videoId}`, {
        withCredentials: true,
      });
      setIsSubscribed(data.data.isSubscribed);
      setIsLiked(data.data?.isLiked);
      setVideo(data.data);
    } catch (err) {
      console.error("Failed to load video:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleSubscribe = async () => {
    try {
      const { data } = await axios.post(
        `${backendURL}/subscription/c/${video.ownerDetails._id}`,
        {},
        { withCredentials: true }
      );
      const updated = data?.data?.[0]?.isSubscribed;
      setIsSubscribed(updated);
    } catch (err) {
      console.error("Subscription toggle failed:", err);
    }
  };
  const handleLikeToggle = async () => {
    try {
      await axios.post(
        `${backendURL}/like/toggle/v/${videoId}`,
        {},
        { withCredentials: true }
      );
      setIsLiked((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setCommentLoading(true);
      await axios.post(
        `${backendURL}/comment/${videoId}`,
        { content: commentText },
        { withCredentials: true }
      );
      setCommentText("");
      fetchComments(); // Refresh comments after successful post
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `${backendURL}/like/toggle/c/${commentId}`,
        {},
        { withCredentials: true }
      );
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) newSet.delete(commentId);
        else newSet.add(commentId);
        return newSet;
      });
      fetchComments(); // Refresh comments after like
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleEditComment = async (commentId, oldContent) => {
    const newContent = prompt("Edit your comment:", oldContent);
    if (!newContent || newContent.trim() === "") return;

    try {
      await axios.patch(
        `${backendURL}/comment/c/${commentId}`,
        { content: newContent },
        { withCredentials: true }
      );
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const saveEditedComment = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      await axios.patch(
        `${backendURL}/comment/c/${commentId}`,
        { content: editingText },
        { withCredentials: true }
      );
      setEditingCommentId(null);
      setEditingText("");
      fetchComments();
    } catch (err) {
      console.error("Failed to save edited comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${backendURL}/comment/c/${commentId}`, {
        withCredentials: true,
      });
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  useEffect(() => {
    if (!calledRef.current) {
      fetchVideo();
      fetchComments();
      calledRef.current = true;
    }
  }, [videoId]);

  if (loading)
    return <div className="text-white text-center py-10">Loading...</div>;
  if (!video)
    return (
      <div className="text-red-500 text-center py-10">Video not found</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <CustomVideoPlayer src={video.videofile} />
        <h1 className="text-2xl font-bold text-red-500">{video.title}</h1>
        <div className="text-zinc-400 text-sm flex gap-4 items-center">
          <FaEye />
          <span>{video.views} views</span>
        </div>
        <p className="text-zinc-300 mt-2">{video.description}</p>
        <div className="flex items-center justify-between mt-6 border-t border-zinc-800 pt-6">
          <div className="flex items-center gap-4">
            <img
              src={video.ownerDetails?.avatar}
              alt="channel"
              className="w-12 h-12 rounded-full object-cover border border-red-500"
            />
            <div>
              <Link
                to={`/channel/${video.ownerDetails?.username}`}
                className="text-white font-semibold hover:underline"
              >
                {video.ownerDetails?.fullname}
              </Link>
              <p className="text-zinc-400 text-sm">
                @{video.ownerDetails?.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSubscribe}
            className={`px-4 py-2 rounded text-white text-sm flex items-center gap-2 ${
              isSubscribed
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubscribed ? <FaCheck /> : <FaUserPlus />}
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border transition ${
              isLiked
                ? "bg-red-600 text-white border-red-600"
                : "bg-zinc-800 text-red-500 border-red-500"
            } hover:bg-red-700 hover:text-white`}
          >
            <FaThumbsUp className="text-lg" />
            {isLiked ? "Liked" : "Like"}
          </button>
          <button
            onClick={() => {
              fetchPlaylists();
              setShowPlaylistPopup(true);
            }}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-red-500 bg-zinc-800 text-red-500 hover:bg-red-700 hover:text-white"
          >
            <FaPlus />
            Add to Playlist
          </button>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-red-500">Comments</h3>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-700"
            />
            <button
              onClick={handleAddComment}
              disabled={commentLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              {commentLoading ? "Posting..." : "Comment"}
            </button>
          </div>

          {comments.length === 0 ? (
            <p className="text-zinc-400">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((cmt, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 bg-zinc-800 rounded p-3 border border-zinc-700"
                >
                  <img
                    src={cmt.owner.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-red-500"
                  />
                  <div>
                    <Link
                      to={`/channel/${cmt.owner.username}`}
                      className="text-white font-semibold hover:underline"
                    >
                      @{cmt.owner.username}
                    </Link>
                    {/* <p className="font-semibold text-white">
                      @{cmt.owner.username}
                    </p> */}
                    {editingCommentId === cmt._id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="bg-zinc-700 text-white px-2 py-1 rounded w-full border border-zinc-600"
                        />
                        <button
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          onClick={() => saveEditedComment(cmt._id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{cmt.content}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2 text-sm text-zinc-400">
                    <button
                      onClick={() => handleLikeComment(cmt._id)}
                      className={`flex items-center gap-1 ${
                        cmt.liked
                          ? "text-red-500"
                          : "text-zinc-400 hover:text-red-400"
                      }`}
                    >
                      <FaThumbsUp />
                      <span>{cmt.likeCount}</span>
                    </button>

                    {cmt.owner.username === user.username && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(cmt._id);
                            setEditingText(cmt.content);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-red-600 text-red-400 hover:bg-red-700 hover:text-white transition"
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(cmt._id)}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-red-600 text-red-400 hover:bg-red-700 hover:text-white transition"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {confirmDeleteId && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-zinc-900 border border-red-600 p-6 rounded-lg max-w-md w-full text-center shadow-lg">
                <p className="text-white text-lg mb-4">
                  Are you sure you want to delete this comment?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    onClick={() => {
                      handleDeleteComment(confirmDeleteId);
                      setConfirmDeleteId(null);
                    }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {showPlaylistPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-red-600 p-6 rounded-lg max-w-md w-full text-white shadow-lg">
              <h3 className="text-xl font-bold text-red-500 mb-4">
                Add to Playlist
              </h3>

              {/* Existing playlists */}
              {playlists.length === 0 ? (
                <p className="text-zinc-400">
                  You don't have any playlists yet.
                </p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {playlists.map((pl) => {
                    const alreadyHasVideo = playlistsWithVideo.has(pl._id);
                    return (
                      <li
                        key={pl._id}
                        className="flex justify-between items-center bg-zinc-800 p-2 rounded"
                      >
                        <div>
                          <p className="font-semibold">{pl.title}</p>
                          <p className="text-sm text-zinc-400 line-clamp-1">
                            {pl.description}
                          </p>
                        </div>

                        {alreadyHasVideo ? (
                          <button
                            onClick={async () => {
                              try {
                                await axios.patch(
                                  `${backendURL}/playlist/remove/${videoId}/${pl._id}`,
                                  {},
                                  { withCredentials: true }
                                );
                                // Update the UI
                                setPlaylistsWithVideo((prev) => {
                                  const set = new Set(prev);
                                  set.delete(pl._id);
                                  return set;
                                });
                                setShowPlaylistPopup(false);
                              } catch (err) {
                                console.error(
                                  "Failed to remove video from playlist:",
                                  err
                                );
                              }
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await axios.patch(
                                  `${backendURL}/playlist/add/${videoId}/${pl._id}`,
                                  {},
                                  { withCredentials: true }
                                );
                                // Update the UI
                                setPlaylistsWithVideo((prev) =>
                                  new Set(prev).add(pl._id)
                                );
                                setShowPlaylistPopup(false);
                              } catch (err) {
                                console.error(
                                  "Failed to add video to playlist:",
                                  err
                                );
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                          >
                            Add
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Create new playlist */}
              <h4 className="text-red-500 text-lg mb-2 mt-4">
                Create New Playlist
              </h4>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700 mb-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="w-full bg-zinc-800 px-3 py-2 rounded border border-zinc-700 mb-4"
              />
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mb-2"
                onClick={async () => {
                  if (!newPlaylistName || !newPlaylistDescription) return;

                  try {
                    // 1. Create the new playlist
                    const createRes = await axios.post(
                      `${backendURL}/playlist/`,
                      {
                        name: newPlaylistName,
                        description: newPlaylistDescription,
                      },
                      { withCredentials: true }
                    );

                    const createdPlaylist = createRes.data.data;

                    // 2. Immediately add the video to that playlist
                    await axios.patch(
                      `${backendURL}/playlist/add/${videoId}/${createdPlaylist._id}`,
                      {},
                      { withCredentials: true }
                    );

                    // 3. Cleanup and close modal
                    setPlaylists((prev) => [...prev, createdPlaylist]);

                    // 4. Mark it as containing this video
                    setPlaylistsWithVideo((prev) => {
                      const newSet = new Set(prev);
                      newSet.add(createdPlaylist._id);
                      return newSet;
                    });

                    // 5. Cleanup
                    setNewPlaylistName("");
                    setNewPlaylistDescription("");
                    setShowPlaylistPopup(false); // Optional: refresh playlist list
                  } catch (err) {
                    console.error(
                      "Failed to create playlist and add video:",
                      err
                    );
                  }
                }}
                disabled={
                  !newPlaylistName.trim() || !newPlaylistDescription.trim()
                }
              >
                Create Playlist
              </button>
              <button
                onClick={() => setShowPlaylistPopup(false)}
                className="w-full mt-2 text-sm text-red-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
