import React from "react";
import { Link } from "react-router-dom";
import { FaYoutube, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-zinc-900 border-t border-red-600 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-red-500">VLIB</h2>
          <p className="text-sm text-zinc-400 mt-2">
            A smart video platform for creators and viewers. Stream, share, and
            explore.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-red-400 mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-red-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/watch-history"
                className="hover:text-red-400 transition"
              >
                Watch History
              </Link>
            </li>
            <li>
              <Link
                to={`/channel/${user?.username}`}
                className="hover:text-red-400 transition"
              >
                My Channel
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-red-400 transition">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="text-xl font-semibold text-red-400 mb-3">Connect</h3>
          <div className="flex gap-4 text-xl text-zinc-400">
            <a
              href="https://www.linkedin.com/in/satvic-bajpai-33a554200/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/bajpaisatvic"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.instagram.com/bajpai_satvic/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-sm text-zinc-500 mt-8 border-t border-zinc-800 pt-4">
        &copy; {new Date().getFullYear()} Vlib. All rights reserved.
      </div>
    </footer>
  );
}
