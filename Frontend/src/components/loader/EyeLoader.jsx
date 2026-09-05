import React, { useEffect, useState } from 'react';
import './EyeLoader.css';

const EyeLoader = ({ onFinish, duration = 3200 }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 600);

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

  // 12 Smooth gradient stops for the continuous circular iris spectrum
  const spectrumSegments = [
    { startAngle: 0, endAngle: 30, color1: '#00d4ff', color2: '#0099ff' },   // Cyan to Bright Blue
    { startAngle: 30, endAngle: 60, color1: '#0099ff', color2: '#2a52be' },  // Bright Blue to Royal Blue
    { startAngle: 60, endAngle: 90, color1: '#2a52be', color2: '#6b21a8' },  // Royal Blue to Violet
    { startAngle: 90, endAngle: 120, color1: '#6b21a8', color2: '#a21caf' }, // Violet to Magenta
    { startAngle: 120, endAngle: 150, color1: '#a21caf', color2: '#e11d48' },// Magenta to Deep Pink
    { startAngle: 150, endAngle: 180, color1: '#e11d48', color2: '#f97316' },// Deep Pink to Orange
    { startAngle: 180, endAngle: 210, color1: '#f97316', color2: '#f59e0b' },// Orange to Amber
    { startAngle: 210, endAngle: 240, color1: '#f59e0b', color2: '#eab308' },// Amber to Yellow
    { startAngle: 240, endAngle: 270, color1: '#eab308', color2: '#84cc16' },// Yellow to Lime
    { startAngle: 270, endAngle: 300, color1: '#84cc16', color2: '#10b981' },// Lime to Green
    { startAngle: 300, endAngle: 330, color1: '#10b981', color2: '#06b6d4' },// Green to Teal
    { startAngle: 330, endAngle: 360, color1: '#06b6d4', color2: '#00d4ff' },// Teal to Cyan
  ];

  return (
    <div className={`eye-loader-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="eye-loader-wrapper">
        <svg
          className="medical-eye-svg"
          viewBox="0 0 600 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Mask to keep the eyeball content strictly within the almond eye shape */}
            <clipPath id="eyeApertureClip">
              <path
                d="M 100 180 C 145 88, 455 88, 500 180 C 455 272, 145 272, 100 180 Z"
              />
            </clipPath>

            {/* Circular mask for the colorful iris ring */}
            <mask id="irisRingMask">
              <circle cx="300" cy="180" r="82" fill="black" />
              <circle cx="300" cy="180" r="70" fill="white" />
              <circle cx="300" cy="180" r="44" fill="black" />
            </mask>

            {/* Gradients for each seamless segment of the iris spectrum */}
            {spectrumSegments.map((seg, idx) => (
              <linearGradient
                key={`grad-${idx}`}
                id={`segGrad-${idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={seg.color1} />
                <stop offset="100%" stopColor={seg.color2} />
              </linearGradient>
            ))}

            {/* Subtle soft shadow behind iris for medical depth */}
            <filter id="irisGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. UPPER EYELID CREASE (Static accent line from reference) */}
          <path
            className="eye-crease-line"
            d="M 160 152 C 215 88, 385 88, 440 148"
            stroke="#1e242b"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* 2. LOWER ACCENT LINE (Subtle lower curve from reference) */}
          <path
            className="eye-lower-accent-line"
            d="M 180 205 C 230 268, 370 268, 420 220"
            stroke="#1e242b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 3. EYEBALL CONTENT (Sclera, Iris, Rotating Spectrum Ring, Pupil) */}
          <g clipPath="url(#eyeApertureClip)">
            {/* White Sclera */}
            <path
              d="M 90 180 C 140 70, 460 70, 510 180 C 460 290, 140 290, 90 180 Z"
              fill="#ffffff"
            />

            {/* Iris Outer Dark Housing */}
            <circle
              cx="300"
              cy="180"
              r="74"
              fill="#181c22"
              filter="url(#irisGlow)"
            />

            {/* CONTINUOUS ROTATING COLORFUL IRIS RING */}
            <g className="iris-rotating-spectrum" mask="url(#irisRingMask)">
              {spectrumSegments.map((seg, idx) => {
                const midAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
                return (
                  <g key={`segment-${idx}`} transform={`rotate(${midAngle}, 300, 180)`}>
                    <rect
                      x="290"
                      y="105"
                      width="20"
                      height="75"
                      fill={`url(#segGrad-${idx})`}
                    />
                  </g>
                );
              })}
            </g>

            {/* Inner Iris Dark Ring */}
            <circle
              cx="300"
              cy="180"
              r="45"
              stroke="#14181e"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Deep Dark Stationary Pupil */}
            <circle
              cx="300"
              cy="180"
              r="40"
              fill="#080a0f"
            />

            {/* Subtle Specular Highlight (Reflection at top-right of pupil from reference) */}
            <ellipse
              cx="313"
              cy="164"
              rx="7"
              ry="5.2"
              transform="rotate(-28, 313, 164)"
              fill="#ffffff"
              opacity="0.9"
            />
            <circle
              cx="322"
              cy="172"
              r="2"
              fill="#ffffff"
              opacity="0.6"
            />

            {/* 4. BLINKING EYELID CURTAINS (Animated smoothly to open and blink naturally) */}
            <g className="eyelid-blink-curtain">
              <path
                className="upper-lid-curtain"
                d="M 90 180 C 140 85, 460 85, 510 180 L 510 60 L 90 60 Z"
                fill="#ffffff"
              />
              <path
                className="lower-lid-curtain"
                d="M 90 180 C 140 275, 460 275, 510 180 L 510 300 L 90 300 Z"
                fill="#ffffff"
              />
            </g>
          </g>

          {/* 5. MAIN UPPER EYELID CONTOUR & CORNER WINGS (Rendered on top) */}
          <path
            className="main-upper-eyelid-path"
            d="M 95 186 C 145 88, 455 88, 505 186"
            stroke="#181c22"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* Left Corner Wing */}
          <path
            d="M 98 186 C 82 189, 70 193, 62 195"
            stroke="#181c22"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Right Corner Wing */}
          <path
            d="M 502 186 C 518 189, 530 193, 538 195"
            stroke="#181c22"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* 6. MAIN LOWER EYELID CONTOUR */}
          <path
            className="main-lower-eyelid-path"
            d="M 100 182 C 145 272, 455 272, 500 182"
            stroke="#181c22"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default EyeLoader;
