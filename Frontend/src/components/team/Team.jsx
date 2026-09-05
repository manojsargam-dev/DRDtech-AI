import React from 'react';
import './Team.css';

const teamMembers = [
  {
    id: 1,
    name: 'Ravindra Rajpurohit',
    role: 'ML Developer',
    github: 'https://github.com/Stackseer',
    linkedin: 'https://linkedin.com',
    email: 'mailto:riag31091@gmail.com'
  },
  {
    id: 2,
    name: 'Manoj Sargam',
    role: 'Backend Developer',
    github: 'https://github.com/manojsargam-dev',
    linkedin: 'https://www.linkedin.com/in/manoj-sargam-b25526383/',
    email: 'mailto:celltab2025@gmail.com'
  },
  {
    id: 3,
    name: 'Aditya Armare',
    role: 'Frontend Developer',
    github: 'https://github.com/ADITYA-ARMARE',
    linkedin: 'https://www.linkedin.com/in/aditya-armare',
    email: 'mailto:aditya.armare123@gmail.com'
  },
  {

    id: 4,
    name: 'Samarth Chavan',
    role: 'Frontend Developer',
    github: 'https://github.com/Samarth1221051',
    linkedin: 'https://linkedin.com/',
    email: 'mailto:samarthchavanwork12@gmail.com'
  },
   {
    id: 5,
    name: 'Manish Annaldas',
    role: 'ML Developer',
    github: 'https://github.com/manish-252A',
    linkedin: 'https://linkedin.com',
    email: 'mailto: manishannaldashack@gmail.com'
  },
   {
    id: 6,
    name: 'Sanchi Sane',
    role: 'UI/UX Designer',
    github: 'https://github.com/Sanchisane04',
    linkedin: 'https://www.linkedin.com/in/sanchi-sane-7508a9381',
    email: 'mailto:sanchi.sane04@gmail.com'
  }
];

const Team = () => {
  return (
    <section id="team" className="team-section">
      <div className="team-container container">
        <h2 className="section-title">Meet Our Team</h2>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              {/* Avatar & Hover Social Overlay Container */}
              <div className="team-avatar-container">
                <div className="team-avatar-graphic">
                  <svg 
                    viewBox="0 0 160 160" 
                    className="avatar-svg"
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Soft Slate-Lavender Circular Background */}
                    <circle cx="80" cy="80" r="76" fill="#a4b1dc" />
                    
                    {/* Head Silhouette */}
                    <circle cx="80" cy="58" r="28" fill="#ffffff" />
                    
                    {/* Torso / Shoulders Silhouette */}
                    <path 
                      d="M28 140 C32 104 55 94 80 94 C105 94 128 104 132 140 Z" 
                      fill="#ffffff" 
                    />
                  </svg>
                </div>

                {/* Dynamic Hover Pop-up Social Ribbon */}
                <div className="team-social-overlay">
                  <div className="team-social-bar">
                    {/* Email / Mail */}
                    <a 
                      href={member.email} 
                      className="social-btn" 
                      title="Send Email"
                      aria-label="Email"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </a>

                    {/* GitHub */}
                    <a 
                      href={member.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-btn" 
                      title="GitHub Profile"
                      aria-label="GitHub"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-btn" 
                      title="LinkedIn Profile"
                      aria-label="LinkedIn"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66 0-.91-.74-1.66-1.66-1.66-.92 0-1.66.75-1.66 1.66 0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="team-details">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
