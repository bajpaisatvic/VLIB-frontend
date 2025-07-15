import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import { AuthProvider, useAuth } from "./contexts/authContext.jsx";
import NotFound from "./components/NotFound.jsx";
import ProfileDashboard from "./components/ProfileDashBoard.jsx";
import ChangePassword from "./components/ChangePassword.jsx";
import ChannelDashboard from "./components/ChannelDashboard.jsx";
import WatchHistory from "./components/WatchHistory.jsx";
import YourChannel from "./components/Channel.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx";
import Subscriptions from "./components/Subscriptions.jsx";
import Tweets from "./components/Tweets.jsx";
import Playlists from "./components/Playlist.jsx";
import PlaylistPage from "./components/PlaylistPage.jsx";
import Post from "./components/Post.jsx";
import About from "./components/About.jsx";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white">Loading...</div>;
  return user ? <Home /> : <Login />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<ProtectedRoute />} />
      <Route path="profile" element={<ProfileDashboard />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="channel-dashboard" element={<ChannelDashboard />} />
      <Route path="watch-history" element={<WatchHistory />} />
      <Route path="channel/:username" element={<YourChannel />} />
      <Route path="/watch/:videoId" element={<VideoPlayer />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="tweets" element={<Tweets />} />
      <Route path="playlists" element={<Playlists />} />
      <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
      <Route path="post" element={<Post />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
