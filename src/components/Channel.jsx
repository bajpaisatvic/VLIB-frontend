import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaCamera,
  FaEye,
  FaHeart,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

export default function YourChannel() {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [tweets, setTweets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [likedTweets, setLikedTweets] = useState(new Set());
  const [editingText, setEditingText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const [confirmDeleteVidId, setConfirmDeleteVidId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newThumbnail, setNewThumbnail] = useState(null);
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // → 14 Jul 2025
  };
  const { user } = useAuth();

  const handleUpdateTweet = async (tweetId) => {
    if (!editingText.trim()) return;
    try {
      await axios.patch(
        `${backendURL}/tweet/${tweetId}`,
        { content: editingText },
        { withCredentials: true }
      );
      setEditingId(null);
      setEditingText("");
      fetchTweets();
    } catch (err) {
      console.error("Error updating tweet:", err);
    }
  };
  const handleToggleLike = async (tweetId) => {
    try {
      await axios.post(
        `${backendURL}/like/toggle/t/${tweetId}`,
        {},
        { withCredentials: true }
      );
      setLikedTweets((prev) => {
        const set = new Set(prev);
        set.has(tweetId) ? set.delete(tweetId) : set.add(tweetId);
        return set;
      });
      fetchTweets();
    } catch (err) {
      console.error("Error toggling tweet like:", err);
    }
  };
  const fetchTweets = async () => {
    try {
      const res = await axios.get(`${backendURL}/tweet/user/${channel?._id}`, {
        withCredentials: true,
      });
      const data = res.data.data || [];

      setTweets(data);
      const liked = data.filter((t) => t.liked === true).map((t) => t._id);
      setLikedTweets(new Set(liked));
    } catch (err) {
      console.error("Error fetching tweets:", err.message);
    }
  };
  const handleDeleteTweet = async (tweetId) => {
    try {
      await axios.delete(`${backendURL}/tweet/${tweetId}`, {
        withCredentials: true,
      });
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting tweet:", err);
    }
  };
  const fetchChannel = async () => {
    try {
      const res = await axios.get(`${backendURL}/users/channel/${username}`, {
        withCredentials: true,
      });
      setChannel(res.data.data);
    } catch (err) {
      console.error(
        "Error fetching channel:",
        err.response?.data || err.message
      );
      setErrorMsg(err.response?.data?.message || "Failed to load channel.");
    }
  };
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${backendURL}/video/channel/${username}`, {
          withCredentials: true,
        });
        setVideos(res.data.data || []);
      } catch (err) {
        console.error("Error fetching videos:", err.message);
      }
    };

    fetchChannel();
    fetchVideos();
    setLoading(false);
  }, [username]);

  useEffect(() => {
    if (channel && activeTab === "tweets") {
      fetchTweets();
    }
  }, [activeTab, channel]);

  const handleToggleSubscribe = async () => {
    try {
      const { data } = await axios.post(
        `${backendURL}/subscription/c/${channel._id}`,
        {},
        { withCredentials: true }
      );

      const updatedStatus = data?.data?.[0]?.isSubscribed;
      setChannel((prev) => ({
        ...prev,
        isSubscribed: updatedStatus,
      }));
      fetchChannel();
    } catch (err) {
      console.error("Failed to toggle subscription:", err);
    }
  };

  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading channel...</div>
    );
  if (errorMsg)
    return <div className="text-red-500 text-center mt-10">{errorMsg}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cover Image */}
      <div className="relative w-full h-64 bg-zinc-800 flex items-center justify-center">
        {channel?.coverimage ? (
          <img
            src={channel.coverimage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FaCamera className="text-3xl text-red-600 mb-2" />
            <p className="text-red-500">No Cover Image</p>
            <p className="text-sm text-zinc-400">Channel has no cover image</p>
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="max-w-3xl mx-auto -mt-16 p-6 rounded-xl border border-red-600 bg-zinc-900 text-center shadow-lg relative z-10 hover:scale-105 transition-transform duration-300 animate-borderFlow">
        <div className="flex justify-center mb-4">
          {channel?.avatar ? (
            <img
              src={channel.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-red-500"
            />
          ) : (
            <FaUser className="w-24 h-24 rounded-full text-red-500 border-2 border-red-500 p-3" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-1">{channel?.fullname}</h2>
        <p className="text-zinc-400">@{channel?.username}</p>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-sm">
            <p className="text-red-400 font-semibold">
              {channel?.subscriberCount}
            </p>
            <p className="text-zinc-400">Subscribers</p>
          </div>
          <div className="text-sm">
            <p className="text-red-400 font-semibold">
              {channel?.subscribedChannels}
            </p>
            <p className="text-zinc-400">Subscribed</p>
          </div>
        </div>

        <div className="mt-4">
          {channel?.isSubscribed ? (
            <p className="inline-block text-xs bg-green-600 px-3 py-1 rounded-full text-white">
              You are subscribed
            </p>
          ) : (
            <button
              onClick={handleToggleSubscribe}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Subscribe
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-6">
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 text-sm rounded ${
            activeTab === "videos"
              ? "bg-red-600 text-white"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("tweets")}
          className={`px-4 py-2 text-sm rounded ${
            activeTab === "tweets"
              ? "bg-red-600 text-white"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          }`}
        >
          Tweets
        </button>
      </div>

      {/* Videos List */}
      <div className="max-w-5xl mx-auto mt-10 px-4">
        {activeTab === "videos" ? (
          <>
            <h3 className="text-2xl font-semibold text-red-500 mb-6">
              Uploaded Videos
            </h3>
            {videos.length === 0 ? (
              <p className="text-zinc-400">
                No videos uploaded by this channel yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <div className="relative bg-zinc-900 rounded-lg border border-red-600 overflow-hidden hover:scale-105 transition-transform duration-300 group">
                    {/* Only thumbnail is clickable */}
                    <Link to={`/watch/${video._id}`}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                    </Link>

                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-white line-clamp-2">
                        {video.title}
                      </h4>
                      <p className="text-sm text-zinc-400 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                        <FaEye />
                        <span>{video.views} views</span>
                      </div>
                    </div>

                    {video.owner.toString() === user._id.toString() && (
                      <div className="absolute top-2 right-2 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId((prev) =>
                              prev === video._id ? null : video._id
                            );
                          }}
                          className="text-white hover:text-red-400"
                        >
                          <FaEllipsisV />
                        </button>

                        {editingId === video._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-2 w-36 bg-zinc-800 border border-zinc-600 rounded z-30 shadow"
                          >
                            <button
                              onClick={() => setEditVideo(video)}
                              className="block px-4 py-2 text-sm hover:bg-zinc-700 w-full text-left"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDeleteVidId(video._id)}
                              className="block px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 w-full text-left"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {editVideo && (
                  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-zinc-900 border border-red-600 p-6 rounded max-w-md w-full text-white">
                      <h3 className="text-xl font-bold text-red-500 mb-4">
                        Edit Video
                      </h3>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="New Title"
                        className="w-full px-4 py-2 mb-2 bg-zinc-800 border border-zinc-700 rounded"
                      />
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="New Description"
                        className="w-full px-4 py-2 mb-2 bg-zinc-800 border border-zinc-700 rounded"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewThumbnail(e.target.files[0])}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded mb-4"
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={async () => {
                            const formData = new FormData();
                            formData.append("title", newTitle);
                            formData.append("description", newDescription);
                            if (newThumbnail)
                              formData.append("thumbnail", newThumbnail);
                            try {
                              await axios.patch(
                                `${backendURL}/video/${editVideo._id}`,
                                formData,
                                {
                                  withCredentials: true,
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                }
                              );
                              setEditVideo(null);
                              setNewTitle("");
                              setNewDescription("");
                              setNewThumbnail(null);
                              // refresh video list
                              const res = await axios.get(
                                `${backendURL}/video/channel/${username}`,
                                { withCredentials: true }
                              );
                              setVideos(res.data.data || []);
                            } catch (err) {
                              console.error("Failed to update video", err);
                            }
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditVideo(null)}
                          className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {confirmDeleteVidId && (
                  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-zinc-900 border border-red-600 p-6 rounded max-w-sm w-full text-center">
                      <p className="text-white text-lg mb-4">
                        Are you sure you want to delete this video?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={async () => {
                            try {
                              await axios.delete(
                                `${backendURL}/video/${confirmDeleteVidId}`,
                                { withCredentials: true }
                              );
                              setConfirmDeleteVidId(null);
                              const res = await axios.get(
                                `${backendURL}/video/channel/${username}`,
                                { withCredentials: true }
                              );
                              setVideos(res.data.data || []);
                            } catch (err) {
                              console.error("Error deleting video", err);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteVidId(null)}
                          className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-red-500 mb-6">
              Tweets by @{channel.username}
            </h3>
            {tweets.length === 0 ? (
              <p className="text-zinc-400">No tweets yet.</p>
            ) : (
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div
                    key={tweet._id}
                    className="bg-zinc-900 border border-red-600 rounded p-4 shadow-md hover:bg-zinc-800 transition"
                  >
                    {/* Owner */}
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={tweet.owner?.avatar || "/default-avatar.png"}
                        alt="owner"
                        className="w-10 h-10 rounded-full border border-red-500 object-cover"
                      />
                      <div>
                        <p className="text-white font-semibold">
                          {tweet.owner?.fullname || "Anonymous"}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          @{tweet.owner?.username}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Posted on: {formatDate(tweet.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    {editingId === tweet._id ? (
                      <>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-600"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleUpdateTweet(tweet._id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                            className="px-3 py-1 bg-zinc-600 hover:bg-zinc-500 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-300">{tweet.content}</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4 text-sm text-zinc-400">
                      <button
                        onClick={() => handleToggleLike(tweet._id)}
                        className={`flex items-center gap-1 ${
                          likedTweets.has(tweet._id)
                            ? "text-red-500"
                            : "hover:text-red-400"
                        }`}
                      >
                        <FaHeart />
                        {tweet.likeCount}
                      </button>

                      {tweet.owner?._id === user._id && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setEditingId(tweet._id);
                              setEditingText(tweet.content);
                            }}
                            className="hover:text-yellow-500"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(tweet._id)}
                            className="hover:text-red-400"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {confirmDeleteId && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-zinc-900 border border-red-600 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                      <p className="text-white text-lg mb-4">
                        Are you sure you want to delete this tweet?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                          onClick={() => handleDeleteTweet(confirmDeleteId)}
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
            )}
          </>
        )}
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
