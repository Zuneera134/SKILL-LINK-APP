import React, { useRef, useState } from "react";
import "../styles/video.css";
import SkillLinkVideo from "../assets/SkillLinkVideo.mp4";
import { VolumeMute, VolumeUp } from "react-bootstrap-icons";

export default function VideoSection() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="video-section">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        className="video-bg"
      >
        <source src={SkillLinkVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* <div className="video-text">
        <h1>Connecting You With Trusted Skilled Professionals</h1>
        <p>Fast • Reliable • Verified Workers</p>
      </div> */}

      <button className="mute-btn" onClick={toggleSound}>
        {muted ? <VolumeMute size={24} /> : <VolumeUp size={24} />}
      </button>
    </div>
  );
}
