import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Post() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnail || !title || !description) return;

    const formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);
    formData.append("title", title);
    formData.append("description", description);

    setUploading(true);
    try {
      const { data } = await axios.post(
        `${backendURL}/video/`, // your endpoint
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );
      const newVideo = data.data;
      navigate(`/watch/${newVideo._id}`);
    } catch (err) {
      console.error("Failed to upload video:", err);
      alert("Something went wrong!");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
          Upload a Video
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded resize-none h-32"
          />

          <div className="flex flex-col gap-2">
            <label className="text-zinc-400">Select Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="bg-zinc-900 text-white file:bg-red-600 file:border-none file:px-4 file:py-2 file:rounded file:text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-400">Select Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="bg-zinc-900 text-white file:bg-red-600 file:border-none file:px-4 file:py-2 file:rounded file:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded text-white font-semibold ${
              uploading
                ? "bg-zinc-700 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {uploading ? `Uploading... ${progress}%` : "Upload Video"}
          </button>
          {uploading && (
            <div className="w-full bg-zinc-700 rounded h-4 mt-2">
              <div
                className="bg-red-500 h-4 rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
