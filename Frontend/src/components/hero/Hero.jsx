import React from 'react';
import './Hero.css';
import heroImg from '../../assets/hero-doctor.png';
import { MessageSquare } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      {/* Decorative Wave Background */}
      <div className="hero-wave-bg">
        <svg viewBox="0 0 1440 450" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path 
            d="M0,0 C320,120 420,40 700,90 C980,140 1150,30 1440,70 L1440,0 L0,0 Z" 
            fill="#eef2fc"
          />
          <path 
            d="M0,0 C200,90 480,10 780,70 C1080,130 1260,20 1440,50 L1440,0 L0,0 Z" 
            fill="#e4ebf9" 
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="hero-container container">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div className="hero-content">
            <h1 className="hero-title">
             ​Detect Retinopathy in Seconds.<br />
              <span>Save Vision for Life.</span>
            </h1>
            <p className="hero-description">
              DRDtech AI delivers instant, offline-capable retinal screening powered by lightweight explainable AI tailored for community health workers and clinicians to bridge the gap in rural eyecare.
            </p>
          </div>

          {/* Right Hero Graphic with Organic Backdrop */}
          <div className="hero-media-wrapper">
            <div className="hero-blob-backdrop" />
            <div className="hero-image-card">
              <img 
                src={heroImg} 
                alt="Medicall Healthcare Professional and Medical Elements" 
                className="hero-image"
              />
            </div>
            
            {/* Floating Chat/Support Bubble */}
            <div className="hero-floating-chat" title="Chat with Health Assistant">
              <MessageSquare size={22} className="chat-icon" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
