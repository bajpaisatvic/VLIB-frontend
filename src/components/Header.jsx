import { useAuth } from "../contexts/authContext";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

const Header = () => {
  const { user } = useAuth();
  const [logoVisible, setLogoVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_PRODUCTION_URL;
  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendURL}/users/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };

  return (
    <header className="sticky top-0 bg-black text-red-500 px-6 py-4 flex items-center justify-between border-b border-red-600 shadow-md z-50">
      {/* Glowing Tailwind Logo */}
      <Link
        to="/"
        className={`text-3xl font-extrabold tracking-wide bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-transparent bg-clip-text drop-shadow-[0_0_12px_rgba(255,0,0,0.75)] transition-all duration-700 ease-in-out ${
          logoVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        VLIB
      </Link>

      {/* Burger Menu (mobile only) */}
      {user && (
        <button
          className="text-white text-2xl md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Desktop Navigation */}
      {user && (
        <nav className="hidden md:flex gap-8 text-lg font-medium">
          {[
            ["/tweets", "Tweet"],
            ["/playlists", "Playlists"],
            ["/subscriptions", "Subscriptions"],
            ["/post", "Post"],
          ].map(([path, label]) => (
            <Link
              key={label}
              to={path}
              className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}

      {/* Profile Icon with Dropdown */}
      {user && (
        <Link
          to="/profile"
          className="hidden md:block text-2xl text-white hover:text-red-400"
        >
          <img
            // onClick={navigate("/profile")}
            src={user?.avatar || "/default-avatar.png"}
            alt="owner"
            className="w-10 h-10 rounded-full border border-red-500 object-cover"
          />
        </Link>
      )}

      {/* Mobile Nav Dropdown */}
      {isOpen && user && (
        <div className="absolute top-full left-0 w-full bg-black border-t border-red-600 py-4 md:hidden z-40 flex flex-col items-center gap-4 text-lg font-medium">
          <Link to="/tweets" className="hover:underline" onClick={toggleMenu}>
            Tweet
          </Link>
          <Link
            to="/playlists"
            className="hover:underline"
            onClick={toggleMenu}
          >
            Playlists
          </Link>
          <Link
            to="/subscriptions"
            className="hover:underline"
            onClick={toggleMenu}
          >
            Subscriptions
          </Link>
          <Link to="/post" className="hover:underline" onClick={toggleMenu}>
            Post
          </Link>
          <Link to="/profile" className="hover:underline" onClick={toggleMenu}>
            View Profile
          </Link>
          <button onClick={handleLogout} className="text-white hover:underline">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
