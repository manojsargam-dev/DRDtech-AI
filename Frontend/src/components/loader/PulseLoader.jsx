import React, { useEffect, useState } from 'react';
import './PulseLoader.css';

const PulseLoader = ({ onFinish, duration = 2800 }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out slightly before finishing
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500);

    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div className={`pulse-loader-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="pulse-loader-wrapper">
        <svg
          className="pulse-svg"
          viewBox="0 0 240 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint static baseline pulse track (as seen in screenshots) */}
          <path
            className="pulse-track-line"
            d="M 30 50 L 75 50 L 85 38 L 95 50 L 105 12 L 115 88 L 125 32 L 135 50 L 210 50"
            stroke="#ccd5f7"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active sweeping dark blue pulse wave */}
          <path
            className="pulse-active-line"
            d="M 30 50 L 75 50 L 85 38 L 95 50 L 105 12 L 115 88 L 125 32 L 135 50 L 210 50"
            stroke="#344199"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default PulseLoader;
