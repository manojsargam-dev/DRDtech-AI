# 👁️ DRDtech AI - Frontend Web Application

A modern, responsive, and interactive Detection  web application for the **DRDtech AI** Retinal Analysis platform. Built with **React 19**, **Vite**, and clean **Vanilla CSS**, it provides an intuitive interface for clinicians to register patients, upload fundus scans, and inspect AI-driven Diabetic Retinopathy diagnoses with Grad-CAM heatmaps and blood vessel segmentation.

---

## 🚀 Key Features

- **Modern & Responsive UI**: Clean clinical design with smooth micro-interactions, dark/light theme elements, and mobile responsiveness.
- **Interactive Landing Page**: Featuring Hero section, Feature spotlights, Benefits overview, "Why Us" comparison, FAQ accordion, and Team profiles.
- **Doctor & User Authentication**: Seamless modal-based Sign In / Sign Up flows with secure JWT token state management.
- **Structured Patient Intake Form**: Simple and comprehensive form to record patient vitals, medical history, and scan metadata before testing.
- **Drag-and-Drop Retinal Image Upload**: Instant image selection with live preview and validation for fundus retinal photographs.
- **Real-Time AI Detection  Dashboard**:
  - 🔍 **Original Fundus Scan Viewer** with zoom and high-resolution inspection.
  - 📊 **Diabetic Retinopathy Grading**: Categorized across 5 clinical stages (No DR, Mild, Moderate, Severe, Proliferative) with confidence percentages.
  - 🧠 **Grad-CAM Heatmap Visualization**: Highlights pathological areas (microaneurysms, hemorrhages, hard exudates) driving the AI prediction.
  - 🩸 **U-Net Retinal Vessel Segmentation Mask**: Visualizes the segmented retinal vascular tree.
  - 🩺 **Clinical Recommendations & Actionable Insights**: Next-step guidance tailored to the detected severity stage.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Vanilla CSS (Modular design system with CSS custom properties)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📋 Prerequisites

To clone and run this application, you'll need:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18.0.0 or higher with `npm`)

---

## 💻 How To Use

To clone and run this application, you'll need Git and Node.js (which comes with npm) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/manojsargam-dev/DRDtech-AI.git

# Go into the Frontend directory
$ cd "DRDtechAI/Frontend"

# Install dependencies
$ npm install

# Run the development server
$ npm run dev
```

The web application will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `Frontend` directory by copying the provided example:

```bash
# On Windows PowerShell
$ Copy-Item .env.example .env

# On Linux / macOS / Bash
$ cp .env.example .env
```

Configure the following environment variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend Express API base URL | `http://localhost:3000` |
| `VITE_ML_API_URL` | AI Microservice (DR_AI_SERVER) base URL | `http://localhost:8000` |

> [!IMPORTANT]
> Populate your `.env` keys with their respective values before running the app. Ensure both the **Backend API** (`http://localhost:3000`) and **DR_AI_SERVER** (`http://localhost:8000`) are running for full end-to-end functionality.

> [!NOTE]
> If you are running the frontend on a different port or host, make sure to update the `CLIENT_URL` variable in the `Backend/.env` configuration to prevent CORS errors.

---

## 📂 Project Structure

```text
Frontend/
├── public/                 # Static assets and icons
├── src/
│   ├── assets/             # Brand logos, illustrations, and images
│   ├── components/         # Modular UI components
│   │   ├── auth/           # Login & Register modals
│   │   ├── benefits/       # Benefits section
│   │   ├── Detection Report/# AI Results visualizer & analysis dashboard
│   │   ├── faq/            # FAQ accordion component
│   │   ├── features/       # Feature highlights
│   │   ├── footer/         # Footer navigation
│   │   ├── hero/           # Hero landing banner
│   │   ├── loader/         # Loading animation indicators
│   │   ├── navbar/         # Main navigation bar
│   │   ├── patientIntake/  # Patient registration form
│   │   ├── team/           # Team introduction cards
│   │   └── whyUs/          # Why Choose Us comparison
│   ├── services/           # Axios API services and endpoints
│   ├── App.jsx             # Main application orchestrator
│   ├── App.css             # Component layout styles
│   ├── index.css           # Global design system, typography & variables
│   └── main.jsx            # React root mount
├── .env.example            # Environment variables template
├── package.json            # Node dependencies and scripts
└── vite.config.js          # Vite build configuration
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Bundles and optimizes the production application in `dist/` |
| `npm run preview` | Locally previews the production build output |
| `npm run lint` | Runs Oxlint to check code quality and syntax standards |
