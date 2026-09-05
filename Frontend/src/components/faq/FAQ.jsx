import React, { useState } from 'react';
import './FAQ.css';
import { 
  ChevronDown, 
  Stethoscope, 
  Syringe, 
  HeartPulse, 
  Truck, 
  FlaskConical, 
  BriefcaseMedical, 
  Pill, 
  PillBottle
} from 'lucide-react';

const faqsData = [
  {
    id: 1,
    question: 'How does DRDtech AI assist doctors in verifying AI outputs?',
    answer: 'The platform uses Grad-CAM (Gradient-weighted Class Activation Mapping) to highlight exact lesion areas—such as microaneurysms—in bright red overlays, providing full diagnostic transparency.'
  },
  {
    id: 2,
    question: 'What equipment is required for field screening?',
    answer: 'A standard fundus camera or smartphone-compatible non-mydriatic camera.'
  },
  {
    id: 3,
    question: 'Is it complex to use?',
    answer: 'Not at all. DRDtech AI is designed specifically for non-specialist community health workers (like ASHA workers). The interface features a guided 3-step digital intake flow, automatic image quality enhancer, and clear color-coded outputs so anyone can operate it with minimal training.'
  },
  {
    id: 4,
    question: 'How many people have joined / been screened?',
    answer: 'DRDtech AI is actively powering rural outreach programs and field screening initiatives across multiple regional clusters, enabling hundreds of frontline healthcare workers to screen thousands of patients in remote primary health centers.'
  },
  {
    id: 5,
    question: 'What is the accuracy of DRDtech AI',
    answer: 'The platform achieves over 90% sensitivity for early-stage lesion detection (Stage 1 NPDR microaneurysms) and >89% specificity in real-world triage environments, ensuring reliable risk stratification without overburdening local clinicians.'
  }
];

const medicalIcons = [
  { Icon: Stethoscope, label: 'Doctor Consultation', top: '10%', left: '42%' },
  { Icon: Syringe, label: 'Immunization & Diagnostics', top: '22%', left: '72%' },
  { Icon: HeartPulse, label: 'Cardio & Vitals', top: '48%', left: '15%' },
  { Icon: PillBottle, label: 'Emergency Support', top: '48%', left: '50%' },
  { Icon: FlaskConical, label: 'Lab & Diagnostics', top: '50%', left: '80%' },
  { Icon: BriefcaseMedical, label: 'First Aid & Care', top: '75%', left: '35%' },
  { Icon: Pill, label: 'Pharmacy & Prescriptions', top: '78%', left: '68%' },
];

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container container">
        <div className="faq-grid">
          {/* Left: Medical Icons Constellation */}
          <div className="faq-visual">
            <div className="faq-constellation-board">
              <div className="constellation-glow" />
              {medicalIcons.map((item, index) => {
                const IconComponent = item.Icon;
                return (
                  <div
                    key={index}
                    className={`medical-icon-bubble bubble-${index + 1}`}
                    style={{ top: item.top, left: item.left }}
                    title={item.label}
                  >
                    <IconComponent size={22} className="bubble-icon" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: FAQ Accordions */}
          <div className="faq-content">
            <h2 className="faq-title">Any Queries?</h2>

            <div className="faq-accordion-list">
              {faqsData.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className={`faq-accordion-item ${isOpen ? 'faq-item-open' : ''}`}
                  >
                    <button 
                      className="faq-question-btn"
                      onClick={() => toggleFAQ(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <ChevronDown 
                        size={18} 
                        className={`faq-chevron ${isOpen ? 'rotated' : ''}`} 
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-answer-panel">
                        <p className="faq-answer-text">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
