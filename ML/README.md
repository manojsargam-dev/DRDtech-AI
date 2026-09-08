# 🧠 DR_AI_SERVER - DR Detection Engine

A high-performance **Deep Learning Microservice** built with **FastAPI**, **TensorFlow/Keras**, and **OpenCV**. It delivers automated **Diabetic Retinopathy (DR) grading**, **Grad-CAM explainability heatmaps**, and **retinal blood vessel segmentation** from fundus photographs.

---

## 🚀 Key Features

- **Diabetic Retinopathy Classification**: Powered by a fine-tuned [ResNet-101](https://keras.io/api/applications/resnet/) model trained on the [APTOS 2019 Blindness Detection](https://www.kaggle.com/c/aptos2019-blindness-detection) dataset.
  - Classifies retinal scans across 5 clinical stages:
    - `0` - No Diabetic Retinopathy
    - `1` - Mild
    - `2` - Moderate
    - `3` - Severe
    - `4` - Proliferative Diabetic Retinopathy
- **Explainable AI (Grad-CAM)**: Generates Gradient-weighted Class Activation Mapping ([Grad-CAM](https://arxiv.org/abs/1610.02391)) overlays highlighting the anatomical lesions (exudates, hemorrhages) influencing model predictions.
- **Retinal Blood Vessel Segmentation**: Implements a deep [U-Net](https://arxiv.org/abs/1505.04597) convolutional network trained on the [DRIVE](https://drive.grand-challenge.org/) dataset to segment the retinal microvasculature.
- **Flexible Dual Ingestion**: Supports both direct multipart file uploads (`multipart/form-data`) and remote image URLs (Cloudinary, AWS S3, etc.).
- **Async High-Throughput API**: Built with [FastAPI](https://fastapi.tiangolo.com/) and [Uvicorn](https://www.uvicorn.org/) for fast, asynchronous inference requests.
- **Static Artifact Delivery**: Built-in static file server to deliver generated Grad-CAM heatmaps, vessel masks, and preprocessed scans via `/outputs`.

---

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Deep Learning**: [TensorFlow](https://www.tensorflow.org/) (v2.20+) & [Keras](https://keras.io/) (v3.12+)
- **Computer Vision & Image Processing**: [OpenCV (opencv-python)](https://opencv.org/), [Pillow (PIL)](https://python-pillow.org/), [NumPy](https://numpy.org/)
- **Data Validation**: [Pydantic](https://docs.pydantic.dev/)

---

## 📋 Prerequisites

To run this AI microservice locally, you'll need:
- [Git](https://git-scm.com/)
- [Python](https://www.python.org/) (Version 3.10 or 3.11 recommended)
- `pip` (Python package installer)
- `venv` or `conda` virtual environment tool

---

## 💻 How To Use

To clone and run this application, you'll need Git and Python installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/your-username/DRDTech-AI.git

# Go into the AI server directory
$ cd ML

# Create and activate virtual environment
$ python -m venv venv

# Windows (PowerShell):
$ .\venv\Scripts\Activate.ps1
# Windows (cmd):
$ venv\Scripts\activate
# Linux / macOS / Bash:
$ source venv/bin/activate

# Install Python dependencies
$ pip install -r requirements.txt.utf8

# Run the AI server (starts on http://localhost:8000)
$ uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be running at `http://localhost:8000`. Interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

---

## 📦 Model Weights Setup

Ensure the pre-trained deep learning model weights are present inside the `models/` directory:

```text
DR_AI_SERVER/
└── models/
    ├── resnet101_finetuned_best.keras   # ResNet101 Diabetic Retinopathy Classifier (~287 MB)
    └── drive_vessel_unet.keras          # U-Net Vessel Segmentation Model (~372 MB)
```

> [!IMPORTANT]
> Both `.keras` model weight files must be present in the `models/` directory before starting the server. If downloading from cloud storage or Git LFS, verify the filenames match exactly as listed above.

> [!NOTE]
> If you are using Linux or Windows PowerShell, verify execution policies if running `Activate.ps1` (`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`).

---

## 📡 API Endpoints

### 1. Root & Health Check
- `GET /` - Returns server status message.
- `GET /health` - Health check status endpoint (`{"status": "ok"}`).

### 2. Full Retinal AI Prediction
- `POST /predict`
  - **Form Data Parameters** (provide one):
    - `file`: Retinal image file (`.jpg`, `.jpeg`, `.png`)
    - `image_url`: Publicly accessible image URL (e.g., Cloudinary)
  - **Response Structure**:
    ```json
    {
      "success": true,
      "aptos_prediction": {
        "class_id": 2,
        "class_name": "Moderate",
        "confidence": 0.942,
        "class_probabilities": {
          "No DR": 0.01,
          "Mild": 0.04,
          "Moderate": 0.942,
          "Severe": 0.005,
          "Proliferative DR": 0.003
        }
      },
      "original_image_url": "http://localhost:8000/outputs/<id>_original.jpg",
      "gradcam_heatmap_url": "http://localhost:8000/outputs/<id>_gradcam.png",
      "vessel_mask_url": "http://localhost:8000/outputs/<id>_vessels.png"
    }
    ```

### 3. Static Artifacts
- `GET /outputs/{filename}` - Accesses generated images, Grad-CAM visualizations, and vessel masks.

---

## 📂 Project Structure

```text
DR_AI_SERVER/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app initialization, routes & image processing
│   ├── aptos.py           # ResNet101 DR classification & Grad-CAM generator
│   └── drive.py           # U-Net retinal blood vessel segmentation
├── models/
│   ├── drive_vessel_unet.keras
│   └── resnet101_finetuned_best.keras
├── outputs/               # Auto-generated prediction visualizations & masks
├── uploads/               # Temporary storage for incoming scans
├── requirements.txt.utf8  # Python dependencies
└── pyrightconfig.json     # Python type checker configuration
```
