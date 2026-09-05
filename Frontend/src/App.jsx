import React, { useState, useEffect } from 'react';
import './App.css';
import PulseLoader from './components/loader/PulseLoader';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import Features from './components/features/Features';
import WhyUs from './components/whyUs/WhyUs';
import Benefits from './components/benefits/Benefits';
import Team from './components/team/Team';
import FAQ from './components/faq/FAQ';
import Footer from './components/footer/Footer';
import AuthModal from './components/auth/AuthModal';
import PatientIntake from './components/patientIntake/PatientIntake';
import { authAPI } from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check local storage or verify session with backend
    const cachedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token) {
      if (cachedUser) {
        try {
          setCurrentUser(JSON.parse(cachedUser));
          setIsLoggedIn(true);
        } catch (e) {
          // ignore
        }
      }
      // Validate with backend in background
      authAPI.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setCurrentUser(res.user);
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          // Session expired or invalid
        });
    }
  }, []);

  const handleOpenLogin = () => {
    setAuthView('login');
    setShowAuthModal(true);
  };

  const handleOpenSignup = () => {
    setAuthView('signup');
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user) => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <div className="app-root">
      {/* 1. Animated ECG Heartbeat Pulse Loading Screen on initial visit */}
      {isLoading && (
        <PulseLoader 
          duration={2600} 
          onFinish={() => setIsLoading(false)} 
        />
      )}

      {/* 2. Logged In Portal: Patient Intake & Retina Scan Upload */}
      {!isLoading && isLoggedIn ? (
        <PatientIntake 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      ) : (
        /* 3. Public Landing Page View */
        <div className={`landing-page-wrapper ${!isLoading ? 'visible' : 'hidden'}`}>
          <Navbar 
            onGetStartedClick={handleOpenLogin} 
            onLoginClick={handleOpenLogin}
            onSignupClick={handleOpenSignup}
          />
          
          <main>
            <Hero onGetStarted={handleOpenLogin} />
            <Features />
            <WhyUs />
            <Benefits />
            <Team />
            <FAQ />
          </main>

          <Footer />
        </div>
      )}

      {/* 4. DRDtech AI Authentication Modal (Login & Sign Up) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authView}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
