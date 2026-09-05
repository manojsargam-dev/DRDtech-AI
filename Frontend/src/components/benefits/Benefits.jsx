import React from 'react';
import './Benefits.css';
import { Radio, Accessibility, CalendarClock, Award ,BookOpenText,ScanEye,HandCoins,Hourglass} from 'lucide-react';

const benefitsData = [
  {
    id: 1,
    title: 'Simple,guided and digital mode for analysis.',
    icon: BookOpenText,
    colorTheme: 'orange'
  },
  {
    id: 2,
    title: 'Specialized analysis using Gradcam and heatmaps. ',
    icon: ScanEye,
    colorTheme: 'cyan'
  },
  {
    id: 3,
    title: 'Low cost screening infrastructure.',
    icon: HandCoins,
    colorTheme: 'pink'
  },
  {
    id: 4,
    title: 'Reduced the time for manual detection',
    icon: Hourglass,
    colorTheme: 'indigo'
  }
];

const Benefits = () => {
  return (
    <section id="benefits" className="benefits-section">
      <div className="benefits-container container">
        <h2 className="section-title">Our Benefits</h2>

        <div className="benefits-grid">
          {benefitsData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={`benefit-badge benefit-theme-${item.colorTheme}`}>
                <div className="benefit-icon-box">
                  <Icon size={18} />
                </div>
                <span className="benefit-text">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
