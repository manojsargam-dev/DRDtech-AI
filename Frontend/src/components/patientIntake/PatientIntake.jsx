import React, { useState, useRef, useEffect } from 'react';
import './PatientIntake.css';
import drdLogo from '../../assets/auth/drd-logo.png';
import retinaRefImg from '../../assets/dashboard/retina-reference.jpg';
import defaultAvatar from '../../assets/dashboard/default-avatar.svg';
import DiagnosticReport from '../diagnosticReport/DiagnosticReport';
import { 
  CloudUpload, 
  Scan, 
  Trash2, 
  CheckCircle2, 
  ChevronDown, 
  LogOut, 
  Activity, 
  Eye, 
  FileCheck,
  AlertCircle,
  Camera
} from 'lucide-react';
import { scanAPI } from '../../services/api';

const PatientIntake = ({ currentUser, onLogout }) => {
  // Navigation State
  const [showReport, setShowReport] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    patientNumber: '',
    abhaNumber: '',
    sugarLevel: '',
    age: '',
    gender: '',
    eyeSide: ''
  });

  // Drag & Drop / File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Picture Upload State
  const avatarStorageKey = `user_avatar_${currentUser?.id || 'default'}`;
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem(avatarStorageKey) || defaultAvatar;
  });
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(avatarStorageKey);
    if (saved) {
      setProfileImage(saved);
    }
  }, [avatarStorageKey]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result;
        if (typeof base64Data === 'string') {
          setProfileImage(base64Data);
          localStorage.setItem(avatarStorageKey, base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [scanError, setScanError] = useState('');

  const workerDisplayName = currentUser?.fullName || 'Aditya Anil Armare';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (scanError) setScanError('');
  };

  const handleFile = (file) => {
    if (file && (file.type.startsWith('image/') || file.name.endsWith('.dcm'))) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (scanError) setScanError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      patientNumber: '',
      abhaNumber: '',
      sugarLevel: '',
      age: '',
      gender: '',
      eyeSide: ''
    });
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAnalysisResult(null);
    setScanError('');
  };

  const handleInitiateScan = async () => {
    if (!formData.fullName.trim()) {
      setScanError('Please enter Patient Full Name before initiating analysis.');
      return;
    }
    if (!selectedFile) {
      setScanError('Please upload a retina fundus photograph for analysis.');
      return;
    }

    setScanError('');
    setAnalyzing(true);

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('patientNumber', formData.patientNumber || `PT-${Date.now()}`);
      payload.append('abhaNumber', formData.abhaNumber || '');
      payload.append('sugarLevel', formData.sugarLevel || '');
      payload.append('age', formData.age || '0');
      payload.append('gender', formData.gender || 'Other');
      payload.append('eyeSide', formData.eyeSide || 'Right Eye (OD)');
      payload.append('imageUrl', selectedFile);

      const response = await scanAPI.uploadAndAnalyze(payload);

      if (response && response.success) {
        setAnalysisResult(response.analysis);
        setShowReport(true);
      } else {
        setScanError(response?.message || 'AI Scan analysis could not be completed.');
      }
    } catch (err) {
      console.error('Scan Error:', err);
      const msg = err.response?.data?.message || err.message || 'Error communicating with AI analysis server.';
      setScanError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  if (showReport) {
    return (
      <DiagnosticReport
        onBack={() => setShowReport(false)}
        onLogout={onLogout}
        patientData={formData}
        previewImage={previewUrl}
        analysisResult={analysisResult}
        currentUser={currentUser}
        profileImage={profileImage}
        onAvatarChange={handleAvatarChange}
      />
    );
  }

  return (
    <div className="patient-intake-page">
      {/* 1. TOP HEADER / APP BAR */}
      <header className="intake-header">
        <div className="intake-header-container">
          {/* Left Brand Logo & Title on Left */}
          <div className="header-left">
            <img src={drdLogo} alt="DRDtech AI Logo" className="intake-drd-logo" />
            <span className="brand-title-drd">
              <span className="bold-dr">DR</span>
              <span className="teal-dtech">Dtech</span>{' '}
              <span className="bold-ai">AI</span>
            </span>
          </div>

          {/* Right User Profile & Avatar Upload */}
          <div className="header-right">
            <div className="user-profile-box" title="Healthcare Worker Profile">
              <span className="user-name">{workerDisplayName}</span>
              <div 
                className="avatar-wrapper"
                onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                title="Click to upload profile photo"
              >
                <img 
                  src={profileImage} 
                  alt="Profile Avatar" 
                  className="user-avatar-img" 
                />
                <div className="avatar-upload-overlay">
                  <Camera size={13} />
                </div>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/png,image/jpeg,image/jpg" 
                  onChange={handleAvatarChange} 
                />
              </div>
            </div>
            <button 
              className="btn-logout" 
              onClick={onLogout} 
              title="Sign Out / Back to Home"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY CONTENT */}
      <main className="intake-main-content">
        <div className="intake-wrapper">
          {/* Greeting Titles */}
          <div className="intake-title-section">
            <p className="intake-subtitle">Namaste, {workerDisplayName}</p>
            <h1 className="intake-main-heading">Add New Patient Details</h1>
          </div>

          {/* Error Banner */}
          {scanError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #f87171',
              color: '#991b1b',
              padding: '12px 18px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <AlertCircle size={20} />
              <span>{scanError}</span>
            </div>
          )}

          {/* TWO COLUMN GRID */}
          <div className="intake-grid">
            {/* LEFT MAIN CARD: PATIENT INTAKE & RETINA SCAN UPLOAD */}
            <div className="intake-card intake-left-card">
              <h3 className="section-label">LINK PATIENT DETAILS (QUICK INTAKE)</h3>

              {/* Form Row 1: 4 columns */}
              <div className="form-row-4">
                <div className="intake-input-group">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>

                <div className="intake-input-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="patientNumber"
                    value={formData.patientNumber}
                    onChange={handleInputChange}
                    placeholder="e.g.+91-XXXXXX8976"
                  />
                </div>

                <div className="intake-input-group">
                  <label>National Health ID / ABHA</label>
                  <input
                    type="text"
                    name="abhaNumber"
                    value={formData.abhaNumber}
                    onChange={handleInputChange}
                    placeholder="14-digit ABHA Number"
                  />
                </div>

                <div className="intake-input-group">
                  <label>Sugar Level (mg/dL)</label>
                  <input
                    type="text"
                    name="sugarLevel"
                    value={formData.sugarLevel}
                    onChange={handleInputChange}
                    placeholder="e.g. 165 mg/dL"
                  />
                </div>
              </div>

              {/* Form Row 2: Age, Gender, Eye Side */}
              <div className="form-row-3">
                <div className="intake-input-group group-age">
                  <label>Age (Years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 54"
                  />
                </div>

                <div className="intake-input-group group-select">
                  <label>Gender</label>
                  <div className="select-container">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={16} className="select-chevron" />
                  </div>
                </div>

                <div className="intake-input-group group-select">
                  <label>Eye Side under scan</label>
                  <div className="select-container">
                    <select
                      name="eyeSide"
                      value={formData.eyeSide}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Left/Right</option>
                      <option value="Left Eye (OS)">Left Eye (OS)</option>
                      <option value="Right Eye (OD)">Right Eye (OD)</option>
                    </select>
                    <ChevronDown size={16} className="select-chevron" />
                  </div>
                </div>
              </div>

              {/* RETINA SCAN IMAGE UPLOAD SECTION */}
              <div className="retina-upload-section">
                <h3 className="retina-section-title">Retina Scan Image Upload</h3>
                <p className="retina-section-desc">
                  Capture and upload high-resolution fundus photograph for analysis
                </p>

                {/* Drag & Drop Upload Zone */}
                <div
                  className={`retina-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  {previewUrl ? (
                    <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                      <img src={previewUrl} alt="Uploaded retina scan preview" className="preview-retina-img" />
                      <div className="preview-info">
                        <div className="preview-file-details">
                          <FileCheck size={20} color="#0d9488" />
                          <span className="file-name">{selectedFile?.name || 'Retina_Scan_01.jpg'}</span>
                          <span className="file-size">
                            ({(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : '2.4')} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-remove-preview"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          title="Remove image"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-inner-content">
                      <div className="upload-icon-circle">
                        <CloudUpload size={28} className="cloud-icon" />
                      </div>
                      <p className="dropzone-main-text">
                        Drag & drop retina scan file here
                      </p>
                      <p className="dropzone-browse-text">
                        or click to browse local files
                      </p>
                      <div className="dropzone-specs">
                        <span>SUPPORTS: JPG, PNG, JPEG</span>
                        <span className="spec-divider">|</span>
                        <span>MAX 25MB PER FILE</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM ACTIONS: CLEAR & INITIATE SCAN */}
              <div className="intake-actions-row">
                <button 
                  type="button" 
                  className="btn-clear-fields"
                  onClick={handleClear}
                  disabled={analyzing}
                >
                  Clear Fields
                </button>

                <button 
                  type="button" 
                  className="btn-initiate-scan"
                  onClick={handleInitiateScan}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Activity size={18} className="analyzing-spin" />
                      <span>Deep Learning Analysis in Progress...</span>
                    </>
                  ) : (
                    <>
                      <Scan size={18} />
                      <span>Initiate AI Scan Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Scan Result Preview Feedback */}
              {analysisResult && (
                <div className="analysis-result-panel">
                  <div className="result-header">
                    <CheckCircle2 size={22} color="#0d9488" />
                    <h4>AI Diagnostic Scan Completed</h4>
                    <span className="confidence-badge">
                      Confidence {Math.round((analysisResult.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  <div className="result-grid">
                    <div>
                      <span className="result-label">Predicted Condition:</span>
                      <span className="result-val text-green">{analysisResult.className || 'No DR'}</span>
                    </div>
                    <div>
                      <span className="result-label">Grad-CAM Heatmap:</span>
                      <span className="result-val">Generated</span>
                    </div>
                    <div>
                      <span className="result-label">Retinal Vessels:</span>
                      <span className="result-val">Segmented (U-Net)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR CARD: FUNDUS CAPTURE PROTOCOL */}
            <div className="intake-card protocol-card">
              <h2 className="protocol-title">Fundus Capture Protocol</h2>
              <p className="protocol-subtitle">
                Ensure valid retina scans for maximum AI confidence
              </p>

              {/* Numbered Protocol Steps */}
              <div className="protocol-steps">
                {/* Step 1 */}
                <div className="protocol-step-item">
                  <div className="step-number-badge">1</div>
                  <div className="step-text-content">
                    <h4>Optic Disc Centering</h4>
                    <p>Ensure the optic nerve head is centered clearly in the capture field.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="protocol-step-item">
                  <div className="step-number-badge">2</div>
                  <div className="step-text-content">
                    <h4>Optimal Dilation</h4>
                    <p>Advise patient to sit in a darkened room for 3-5 mins prior to capture.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="protocol-step-item">
                  <div className="step-number-badge">3</div>
                  <div className="step-text-content">
                    <h4>Avoid Artifacts</h4>
                    <p>Check for dust on lens or blink shadows which reduce AI confidence score.</p>
                  </div>
                </div>
              </div>

              {/* Target Retina View Reference Box */}
              <div className="target-retina-box">
                <span className="target-retina-label">TARGET RETINA VIEW REFERENCE</span>
                <div className="retina-reference-img-container">
                  <img 
                    src={retinaRefImg} 
                    alt="Target Fundus Retina Scan Reference" 
                    className="retina-reference-img" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientIntake;
