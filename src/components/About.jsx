import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center justify-center">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-6">
          About Our Platform
        </h1>
        <p className="text-zinc-300 text-lg leading-relaxed mb-8">
          Welcome to our video streaming platform — your one-stop destination
          for high-quality, engaging, and diverse content. Whether you're here
          to enjoy captivating films, explore new creators, or upload your own
          content, our platform is built to deliver the ultimate entertainment
          experience.
        </p>
        <p className="text-zinc-400 text-base mb-10">
          We believe in empowering creators, engaging viewers, and building a
          community where stories thrive. With blazing-fast streaming,
          personalized playlists, and interactive features — we’re more than a
          platform, we’re a home for digital storytelling.
        </p>

        <Link
          to="/"
          className="inline-block bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full text-white font-semibold text-lg shadow-md"
        >
          🎬 Enjoy Streaming
        </Link>
      </div>
    </div>
  );
}
