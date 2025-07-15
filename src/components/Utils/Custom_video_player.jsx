import React, { useRef, useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaExpand,
  FaCompress,
  FaForward,
  FaBackward,
} from "react-icons/fa";

export default function CustomVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", () => setDuration(video.duration));
    return () => {
      video.removeEventListener("timeupdate", updateTime);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
  };

  const handleProgressChange = (e) => {
    const time = (e.target.value / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const forward10 = () => {
    videoRef.current.currentTime += 10;
  };

  const backward10 = () => {
    videoRef.current.currentTime -= 10;
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="relative w-full bg-black aspect-video">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        preload="metadata"
      />
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white px-4 py-2 flex flex-col gap-1">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={100}
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={handleProgressChange}
          className="w-full accent-red-600 cursor-pointer"
        />
        {/* Control Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={backward10} title="Backward 10s">
              <FaBackward />
            </button>
            <button onClick={togglePlay} title="Play/Pause">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={forward10} title="Forward 10s">
              <FaForward />
            </button>

            <div className="flex items-center gap-2">
              <FaVolumeUp />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-red-600"
              />
            </div>
            <span className="text-xs text-zinc-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
}
