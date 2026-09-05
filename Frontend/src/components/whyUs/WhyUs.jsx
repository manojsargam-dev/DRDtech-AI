import React from 'react';
import './WhyUs.css';
import whyCareImg from '../../assets/fundus.png';

const WhyUs = () => {
  return (
    <section id="why-us" className="why-us-section">
      <div className="why-us-container container">
        <div className="why-us-grid">
          {/* Left Media with Organic Morph Frame */}
          <div className="why-us-media">
            <div className="why-us-backdrop" />
            <div className="why-us-image-wrapper">
              <img 
                src={whyCareImg} 
                alt="Compassionate doctor assisting patient" 
                className="why-us-img"
              />
            </div>
          </div>

          {/* Right Text Content */}
          <div className="why-us-content">
            <h2 className="why-us-title">Why do we need?</h2>
            
            <div className="why-us-paragraphs">
              <p>
                Preventable Blindness Burden: Diabetic Retinopathy often develops without early symptoms, making early detection critical to preventing irreversible vision loss.
              </p>
              <p>
                Specialist Shortages: Millions of rural patients lack access to trained ophthalmologists, creating severe diagnostic bottlenecks in primary healthcare.
              </p>
              <p>
                Time-Critical Triage: Traditional screening requires manual evaluation of every image, delaying treatment for high-risk individuals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
