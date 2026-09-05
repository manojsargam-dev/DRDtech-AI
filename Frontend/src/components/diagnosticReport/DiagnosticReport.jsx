import React, { useState, useRef, useEffect } from 'react';
import './DiagnosticReport.css';
import drdLogo from '../../assets/auth/drd-logo.png';
import defaultAvatar from '../../assets/dashboard/default-avatar.svg';
import retinaRefImg from '../../assets/dashboard/retina-reference.jpg';
import retinaHeatmapImg from '../../assets/dashboard/retina-heatmap.jpg';
import retinaVesselsImg from '../../assets/dashboard/retina-vessels.jpg';
import { Check, ArrowLeft, ArrowRightLeft, Printer, Activity, User, Eye, Droplet, Calendar, Camera } from 'lucide-react';

const DiagnosticReport = ({ 
  onBack, 
  onLogout, 
  patientData = {}, 
  previewImage, 
  analysisResult = null, 
  currentUser = null,
  profileImage: propAvatar = null,
  onAvatarChange = null
}) => {
  const workerDisplayName = currentUser?.fullName || 'Aditya Anil Armare';
  const avatarStorageKey = `user_avatar_${currentUser?.id || 'default'}`;
  const [currentAvatar, setCurrentAvatar] = useState(() => {
    return propAvatar || localStorage.getItem(avatarStorageKey) || defaultAvatar;
  });
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (propAvatar) {
      setCurrentAvatar(propAvatar);
    } else {
      const saved = localStorage.getItem(avatarStorageKey);
      if (saved) setCurrentAvatar(saved);
    }
  }, [propAvatar, avatarStorageKey]);

  const handleAvatarSelect = (e) => {
    if (onAvatarChange) {
      onAvatarChange(e);
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result;
        if (typeof base64Data === 'string') {
          setCurrentAvatar(base64Data);
          localStorage.setItem(avatarStorageKey, base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract raw probabilities from model
  const rawProbs = analysisResult?.probabilities;
  let p0 = 0.25, p1 = 0.27, p2 = 0.11, p3 = 0.10, p4 = 0.27;

  if (rawProbs) {
    if (Array.isArray(rawProbs)) {
      p0 = rawProbs[0] ?? 0;
      p1 = rawProbs[1] ?? 0;
      p2 = rawProbs[2] ?? 0;
      p3 = rawProbs[3] ?? 0;
      p4 = rawProbs[4] ?? 0;
    } else if (typeof rawProbs === 'object') {
      p0 = rawProbs['No DR'] ?? rawProbs.noDR ?? 0;
      p1 = rawProbs['Mild'] ?? rawProbs.mild ?? 0;
      p2 = rawProbs['Moderate'] ?? rawProbs.moderate ?? 0;
      p3 = rawProbs['Severe'] ?? rawProbs.severe ?? 0;
      p4 = rawProbs['Proliferative DR'] ?? rawProbs['Proliferative'] ?? rawProbs.proliferative ?? 0;
    }
  }

  // Convert to clean percentage integers that sum approximately to 100
  const pct0 = Math.round(p0 * 100);
  const pct1 = Math.round(p1 * 100);
  const pct2 = Math.round(p2 * 100);
  const pct3 = Math.round(p3 * 100);
  const pct4 = Math.round(p4 * 100);

  const predictedClass = analysisResult?.predictedClass ?? (analysisResult?.predicted_class ?? 0);
  const predictedClassName = analysisResult?.className || analysisResult?.class_name || 'No DR';
  const confidencePercent = analysisResult?.confidence 
    ? Math.round(analysisResult.confidence * 100) 
    : 92;

  // Grades Data
  const grades = [
    { grade: '0', label: 'No DR', percent: pct0, color: '#00838f', isPredicted: predictedClass === 0 },
    { grade: '1', label: 'Mild NPDR', percent: pct1, color: '#e65100', isPredicted: predictedClass === 1 },
    { grade: '2', label: 'Moderate NPDR', percent: pct2, color: '#2e7d32', isPredicted: predictedClass === 2 },
    { grade: '3', label: 'Severe NPDR', percent: pct3, color: '#1976d2', isPredicted: predictedClass === 3 },
    { grade: '4', label: 'PDR', percent: pct4, color: '#7b1fa2', isPredicted: predictedClass === 4 }
  ];

  // SVG Donut Chart Calculation
  const R = 80;
  const circumference = 2 * Math.PI * R; // ~502.65
  let accumulatedOffset = 0;

  // Normalized percentages so donut fills 100% of circumference
  const totalSum = grades.reduce((acc, g) => acc + g.percent, 0) || 1;

  const resolveImageUrl = (imgUrl, fallback) => {
    if (!imgUrl) return fallback;
    if (
      imgUrl.startsWith("http://") ||
      imgUrl.startsWith("https://") ||
      imgUrl.startsWith("blob:") ||
      imgUrl.startsWith("data:")
    ) {
      return imgUrl;
    }
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiBase}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
  };

  // Images
  const rawOriginal = analysisResult?.images?.original || analysisResult?.imageUrl || previewImage;
  const rawHeatmap = analysisResult?.images?.gradcam || analysisResult?.gradcamUrl;
  const rawVessel = analysisResult?.images?.vessel_mask || analysisResult?.vesselMaskUrl;

  const originalImg = resolveImageUrl(rawOriginal, previewImage || retinaRefImg);
  const heatmapImg = resolveImageUrl(rawHeatmap, retinaHeatmapImg);
  const vesselImg = resolveImageUrl(rawVessel, retinaVesselsImg);

  return (
    <div className="diagnostic-report-page">
      {/* 1. TOP HEADER APP BAR */}
      <header className="report-header">
        <div className="report-header-container">
          {/* Left Brand Logo */}
          <div className="report-header-left" onClick={onBack} role="button" title="Back to Intake">
            <img src={drdLogo} alt="DRDtech AI Logo" className="report-drd-logo" />
            <span className="report-brand-text">
              <span className="bold-dr">DR</span>
              <span className="teal-dtech">Dtech</span>{' '}
              <span className="bold-ai">AI</span>
            </span>
          </div>

          {/* Right User Profile */}
          <div className="report-header-right">
            <div className="user-profile-pill">
              <span className="user-name">{workerDisplayName}</span>
              <div 
                className="report-avatar-wrapper"
                onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                title="Click to upload profile photo"
              >
                <img 
                  src={currentAvatar} 
                  alt="Profile Avatar" 
                  className="user-avatar-img" 
                />
                <div className="report-avatar-overlay">
                  <Camera size={11} />
                </div>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/png,image/jpeg,image/jpg" 
                  onChange={handleAvatarSelect} 
                />
              </div>
            </div>
            <button 
              className="btn-switch-back" 
              onClick={onBack} 
              title="Return to Patient Intake"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN REPORT CONTENT */}
      <main className="report-main-content">
        <div className="report-container">
          
          {/* Top Title & Confidence Section */}
          <div className="report-title-row">
            <div className="title-center-block">
              <h1 className="report-main-title">DETAILED DIAGNOSTIC REPORT</h1>
              <div className="report-subtitle-wrap">
                <span className="dash-line">—</span>
                <span className="subtitle-text">
                  AI DR Grade: <strong style={{ color: '#0d9488' }}>{predictedClassName}</strong> (Grade {predictedClass})
                </span>
                <span className="dash-line">—</span>
              </div>
            </div>

            {/* Confidence Card Floating on Right */}
            <div className="report-confidence-card">
              <div className="confidence-icon-box">
                <Check size={20} strokeWidth={3} className="check-icon" />
              </div>
              <div className="confidence-text-group">
                <span className="conf-label">Report<br />Confidence</span>
                <span className="conf-value">{confidencePercent}%</span>
              </div>
            </div>
          </div>

          {/* PATIENT METADATA SUMMARY BAR */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Patient Name</span>
              <p style={{ margin: '4px 0 0', fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{patientData.fullName || 'Patient'}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Patient ID</span>
              <p style={{ margin: '4px 0 0', fontWeight: '600', color: '#334155' }}>{patientData.patientNumber || 'PT-N/A'}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Age / Gender</span>
              <p style={{ margin: '4px 0 0', fontWeight: '600', color: '#334155' }}>{patientData.age ? `${patientData.age} Yrs` : 'N/A'} / {patientData.gender || 'N/A'}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Sugar Level</span>
              <p style={{ margin: '4px 0 0', fontWeight: '600', color: '#334155' }}>{patientData.sugarLevel ? `${patientData.sugarLevel} mg/dL` : 'Normal'}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Eye Scanned</span>
              <p style={{ margin: '4px 0 0', fontWeight: '600', color: '#0d9488' }}>{patientData.eyeSide || 'Right Eye (OD)'}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>ABHA Number</span>
              <p style={{ margin: '4px 0 0', fontWeight: '600', color: '#334155' }}>{patientData.abhaNumber || 'Not Linked'}</p>
            </div>
          </div>

          {/* Action Bar (Print, Download, Back) */}
          <div className="report-quick-actions">
            <button className="btn-action-back" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Back to Patient Intake</span>
            </button>
            <div className="action-buttons-right">
              <button className="btn-action-secondary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: RETINAL ANALYSIS */}
          <section className="report-card retinal-analysis-card">
            <h2 className="card-section-title teal-accent-title">RETINAL ANALYSIS</h2>

            <div className="two-column-images-grid">
              {/* Left: Original Retina Image */}
              <div className="image-column-box">
                <div className="retina-image-frame">
                  <img 
                    src={originalImg} 
                    alt="Original Retina Scan" 
                    className="report-retina-img" 
                  />
                </div>
                <p className="image-caption-label">Original Retina Image</p>
              </div>

              {/* Right: AI Heatmap Analysis */}
              <div className="image-column-box">
                <div className="retina-image-frame heatmap-frame">
                  <img 
                    src={heatmapImg} 
                    alt="AI Grad-CAM Heatmap Analysis" 
                    className="report-retina-img" 
                  />
                </div>
                <p className="image-caption-label">AI Heatmap Analysis (Grad-CAM)</p>
              </div>
            </div>
          </section>

          {/* SECTION 2: GRADE OUTPUT */}
          <section className="report-card grade-output-card">
            <div className="card-title-header">
              <span className="dash-line">—</span>
              <h2 className="card-section-title">GRADE OUTPUT</h2>
              <span className="dash-line">—</span>
            </div>

            <div className="grade-output-grid">
              {/* Left Column: Grade Level Table */}
              <div className="grades-list-container">
                {grades.map((item) => (
                  <div 
                    key={item.grade} 
                    className={`grade-row-item ${item.isPredicted ? 'predicted-active' : ''}`}
                    style={item.isPredicted ? { backgroundColor: '#f0fdfa', borderLeft: '4px solid #0d9488', paddingLeft: '8px' } : {}}
                  >
                    <div className="grade-left-info">
                      <span className="grade-number-badge" style={item.isPredicted ? { backgroundColor: item.color, color: '#fff' } : {}}>{item.grade}</span>
                      <span className="grade-label-text" style={item.isPredicted ? { fontWeight: '700', color: '#0f766e' } : {}}>
                        {item.label} {item.isPredicted && ' ★ (Detected)'}
                      </span>
                    </div>
                    <span className="grade-percent-value" style={item.isPredicted ? { fontWeight: '800', color: '#0f766e' } : {}}>{item.percent}%</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Donut Chart */}
              <div className="donut-chart-container">
                <div className="donut-chart-wrapper">
                  <svg 
                    viewBox="0 0 220 220" 
                    className="donut-svg"
                  >
                    {/* Background Ring */}
                    <circle
                      cx="110"
                      cy="110"
                      r={R}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="48"
                    />

                    {/* Donut Segments */}
                    {grades.map((item, index) => {
                      const normalizedPct = (item.percent / totalSum) * 100;
                      const strokeDash = (normalizedPct / 100) * circumference;
                      const strokeDasharray = `${strokeDash} ${circumference - strokeDash}`;
                      const strokeDashoffset = -accumulatedOffset;
                      accumulatedOffset += strokeDash;

                      return (
                        <circle
                          key={index}
                          cx="110"
                          cy="110"
                          r={R}
                          fill="none"
                          stroke={item.color}
                          strokeWidth="48"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform="rotate(-90 110 110)"
                          className="donut-segment"
                        />
                      );
                    })}

                    {/* Center White Hole */}
                    <circle
                      cx="110"
                      cy="110"
                      r="54"
                      fill="#ffffff"
                    />
                  </svg>

                  {/* Centered Donut Label */}
                  <div className="donut-center-label">
                    <span>Grade {predictedClass}</span>
                    <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: '700' }}>{predictedClassName}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: DRIVE REPORT */}
          <section className="report-card drive-report-card">
            <div className="card-title-header">
              <span className="dash-line">—</span>
              <h2 className="card-section-title">DRIVE VESSEL SEGMENTATION REPORT</h2>
              <span className="dash-line">—</span>
            </div>

            <div className="two-column-images-grid">
              {/* Left: Original Retina */}
              <div className="image-column-box">
                <div className="retina-image-frame">
                  <img 
                    src={originalImg} 
                    alt="Original Retina" 
                    className="report-retina-img" 
                  />
                </div>
                <p className="image-caption-label">Original Retina</p>
              </div>

              {/* Right: Vessel Extracted Image */}
              <div className="image-column-box">
                <div className="retina-image-frame vessel-frame">
                  <img 
                    src={vesselImg} 
                    alt="Vessel Extracted Image" 
                    className="report-retina-img" 
                  />
                </div>
                <p className="image-caption-label">Vessel Extracted Image (U-Net DRIVE)</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default DiagnosticReport;
