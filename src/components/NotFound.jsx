import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-white text-center">
      <h1 className="text-6xl font-extrabold text-red-600 drop-shadow-lg mb-4 animate-pulse">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-zinc-400 max-w-md mb-6">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md transition"
      >
        <FaArrowLeft /> Back to Home
      </Link>
    </div>
  );
}
