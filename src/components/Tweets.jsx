import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import { FaEdit, FaTrash, FaHeart } from "react-icons/fa";

export default function Tweets() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tweetText, setTweetText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [likedTweets, setLikedTweets] = useState(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // → 14 Jul 2025
  };
  const fetchTweets = async () => {
    try {
      const res = await axios.get(`${backendURL}/tweet/user/${user._id}`, {
        withCredentials: true,
      });
      const data = res.data.data || [];

      setTweets(data);
      const liked = data.filter((t) => t.liked === true).map((t) => t._id);
      setLikedTweets(new Set(liked));
    } catch (err) {
      console.error("Error fetching tweets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostTweet = async () => {
    if (!tweetText.trim()) return;
    try {
      await axios.post(
        `${backendURL}/tweet/`,
        { content: tweetText },
        { withCredentials: true }
      );
      setTweetText("");
      fetchTweets();
    } catch (err) {
      console.error("Error posting tweet:", err);
    }
  };

  const handleUpdateTweet = async (tweetId) => {
    if (!editingText.trim()) return;
    try {
      await axios.patch(
        `${backendURL}/tweet/${tweetId}`,
        { content: editingText },
        { withCredentials: true }
      );

      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId ? { ...t, content: editingText } : t
        )
      );
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error updating tweet:", err);
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

  useEffect(() => {
    if (user?._id) fetchTweets();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
        Your Tweets
      </h2>

      {/* Create Tweet */}
      <div className="mb-8 max-w-3xl mx-auto flex gap-3">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
          className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-700"
        />
        <button
          onClick={handlePostTweet}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Tweet
        </button>
      </div>

      {/* Tweets List */}
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <p className="text-zinc-400">Loading tweets...</p>
        ) : tweets.length === 0 ? (
          <p className="text-zinc-400">No tweets found.</p>
        ) : (
          tweets.map((tweet) => (
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
          ))
        )}
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
    </div>
  );
}
