# 🏥 DRDtech AI - Backend API Service

A robust, type-safe REST API server powering the **DRDtech AI** Retinal Disease Diagnosis  platform. Built with **Node.js**, **Express.js**, and **TypeScript**, it handles user authentication, patient records management, cloud retinal scan storage, and orchestrates deep learning inference with the AI microservice.

---

## 🚀 Key Features

- **Robust REST API**: Built on Express 5 and TypeScript with complete type safety and modular MVC architecture.
- **Secure Authentication & Authorization**: JSON Web Token (JWT) in HTTP-only cookies, password encryption via [bcrypt](https://www.npmjs.com/package/bcrypt), and role-aware protected routes.
- **Patient Intake & Medical Records**: MongoDB schemas for managing patient demographics, clinical notes, and historical Diagnosis  scans.
- **Cloud Image Pipeline**: Multer middleware paired with [Cloudinary](https://cloudinary.com/) for secure retinal fundus image uploads and storage.
- **AI Microservice Orchestration**: Seamless integration with `DR_AI_SERVER` (FastAPI) to trigger Diabetic Retinopathy grading and vessel segmentation.
- **Diagnosis  Reports Management**: Aggregates AI predictions, severity confidence, Grad-CAM heatmap URLs, and vessel masks directly into patient histories.


---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Development Tooling**: [tsx](https://github.com/privatenumber/tsx), [ESLint](https://eslint.org/)

---

## 📋 Prerequisites

To run this backend service locally, ensure you have the following installed:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18.0.0 or higher with `npm`)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas connection URI)
- [Cloudinary Account](https://cloudinary.com/) (For API credentials)

---

## 💻 How To Use

To clone and run this application, you'll need Git and Node.js (which comes with npm) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/manojsargam-dev/DRDtech-AI.git

# Go into the Backend directory
$ cd "DRDtechAI/Backend"

# Install dependencies
$ npm install

# Run the development server
$ npm run dev
```

For production builds:

```bash
# Build the TypeScript project
$ npm run build

# Start the compiled production server
$ npm run start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `Backend` directory by copying the provided example:

```bash
# On Windows PowerShell
$ Copy-Item .env.example .env

# On Linux / macOS / Bash
$ cp .env.example .env
```

Configure the following environment variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the Express server | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/RetinalAI` |
| `SECRET` | JWT secret string for token signing | `your_jwt_secret_key` |
| `EXPIRES` | JWT token expiration duration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_cloudinary_api_secret` |
| `CLIENT_URL` | Frontend URL for CORS configuration | `http://localhost:5173` |
| `ML_SERVICE_URL` | AI Microservice (DR_AI_SERVER) endpoint | `http://localhost:8000` |

> [!IMPORTANT]
> Populate your `.env` keys with their respective values before starting the server. Ensure that MongoDB is running and accessible.

> [!NOTE]
> Make sure the **DR_AI_SERVER** is running at `ML_SERVICE_URL` (`http://localhost:8000`) so that image Diagnosis  requests can be processed successfully.

---

## 📂 Project Structure

```text
Backend/
├── src/
│   ├── app.ts            # Express application setup & middleware configuration
│   ├── server.ts         # Server entry point & database connection
│   ├── controllers/      # Route controllers (Auth, Patient, Upload)
│   ├── db/               # Database connection logic
│   ├── middleware/       # JWT auth & multer upload middlewares
│   ├── models/           # Mongoose schemas (User, Patient, Scan)
│   ├── routes/           # Express route definitions
│   ├── services/         # External integrations (Cloudinary, AI Server, Email)
│   └── views/            # EJS email templates
├── .env.example          # Environment variable template
├── package.json          # Node dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode with live reload using `tsx` |
| `npm run build` | Compiles TypeScript files into the `dist/` directory |
| `npm run start` | Runs the production-compiled server from `dist/server.js` |
| `npm run type-check` | Verifies TypeScript types without emitting code |
| `npm run lint` | Runs ESLint to identify code quality and style issues |
