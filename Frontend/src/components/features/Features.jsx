import React from 'react';
import './Features.css';
import { Stethoscope, Activity, Pill,LocateFixed,HeartPulse,ImageUp } from 'lucide-react';

const featuresData = [
  {
    id: 1,
    title: 'High Accuracy AI Analysis',
    description: 'Runs high-accuracy diagnostic models locally on low-cost devices, enabling ASHA workers to screen patients in remote areas without internet connectivity.',
    icon: LocateFixed,
    theme: 'teal'
  },
  {
    id: 2,
    title: '​Explainable Diagnostics (Grad-CAM)',
    description: 'Overlays visual heatmaps onto fundus images, highlighting detected microaneurysms, hemorrhages, and exudates so doctors can verify results instantly. ',
    icon: HeartPulse,
    theme: 'amber'
  },
  {
    id: 3,
    title: 'Automated Image Quality Assessment',
    description: 'The model will automatically enhance captured fundus images to meet diagnostic standards before upload.',
    icon: ImageUp,
    theme: 'coral'
  }
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="features-container container">
        <h2 className="section-title">Our Features</h2>

        <div className="features-grid">
          {featuresData.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.id} className={`feature-card feature-theme-${item.theme}`}>
                <div className="feature-icon-wrapper">
                  <IconComponent size={28} className="feature-icon" />
                </div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
