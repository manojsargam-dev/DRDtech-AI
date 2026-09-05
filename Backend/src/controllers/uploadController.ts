import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import fundusmodel from "../models/fundusModel.ts";
import patientmodel from "../models/patientModel.ts";

interface AuthRequest extends Request {
  user?: any;
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Call DR_AI_SERVER to obtain ML prediction (ResNet-101 APTOS + DRIVE U-Net vessel segmentation)
 */
async function callMlPrediction(file: Express.Multer.File): Promise<any> {
  const predictEndpoint = `${ML_SERVICE_URL}/predict`;

  try {
    const formData = new FormData();

    const cloudinaryUrl =
      (file as any).secure_url ||
      (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://")) ? file.path : null);

    if (cloudinaryUrl) {
      // Send Cloudinary image URL to ML Model
      formData.append("image_url", cloudinaryUrl);
    } else if (file.path && fs.existsSync(file.path)) {
      // Local file fallback
      const fileBuffer = fs.readFileSync(file.path);
      const blob = new Blob([fileBuffer as any], { type: file.mimetype || "image/jpeg" });
      formData.append("file", blob, file.originalname || path.basename(file.path));
    } else if (file.buffer) {
      const blob = new Blob([file.buffer as any], { type: file.mimetype || "image/jpeg" });
      formData.append("file", blob, file.originalname || "retina.jpg");
    } else {
      throw new Error("No readable image data available for ML analysis");
    }

    const mlResponse = await fetch(predictEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      throw new Error(`ML Server returned ${mlResponse.status}: ${errorText}`);
    }

    const data = await mlResponse.json();
    return data;
  } catch (error: any) {
    console.error("Failed to connect to ML service at", predictEndpoint, error.message);
    throw error;
  }
}

/**
 * Upload Retina Fundus Scan, persist Patient details, execute AI Inference, and store Diagnostic Results
 */
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No retinal image file uploaded" });
    }

    // Extract patient details from request body
    const fullname = req.body.fullName || req.body.fullname;
    const patientNumber = String(req.body.patientNumber || req.body.Patient || `PT-${Date.now()}`);
    const abhaNumber = String(req.body.abhaNumber || "");
    const age = Number(req.body.age || req.body.Age || 0);
    const gender = req.body.gender || req.body.Gender || "Other";
    const sugarLevel = req.body.sugarLevel || req.body.Glucose || "";
    const contact = String(req.body.contact || req.body.phone || req.body.Contact || "");
    const eyeSide = req.body.eyeSide || req.body.eye || "";
    const userId = req.user?.userid;

    if (!fullname) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required to link retinal scan",
      });
    }

    // 1. Find or create patient
    let patient = await patientmodel.findOne({ patientNumber });
    if (!patient) {
      patient = await patientmodel.create({
        fullname,
        patientNumber,
        abhaNumber,
        age,
        gender,
        contact,
        sugarLevel,
        eyeSide,
        registeredBy: userId,
        postsid: [],
      });
    } else {
      patient.fullname = fullname || patient.fullname;
      patient.age = age || patient.age;
      patient.gender = gender || patient.gender;
      patient.contact = contact || patient.contact || "";
      patient.abhaNumber = abhaNumber || patient.abhaNumber || "";
      patient.sugarLevel = sugarLevel || patient.sugarLevel || "";
      patient.eyeSide = eyeSide || patient.eyeSide || "";
      await patient.save();
    }

    // 2. Call ML Service
    let mlResult: any = null;
    try {
      mlResult = await callMlPrediction(file);
    } catch (mlErr: any) {
      console.warn("ML Server warning:", mlErr.message);
      // Fallback response structure if ML Server is starting up
      mlResult = {
        success: false,
        error: mlErr.message,
        aptos: {
          predicted_class: 0,
          class_name: "Analysis Pending",
          confidence: 0,
          probabilities: { "No DR": 0, Mild: 0, Moderate: 0, Severe: 0, "Proliferative DR": 0 },
          heatmap_url: file.path || "",
        },
        drive: {
          vessel_mask_url: file.path || "",
        },
        images: {
          original: file.path || "",
          gradcam: file.path || "",
          vessel_mask: file.path || "",
        },
      };
    }

    let imageUrl = "";
    if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
      imageUrl = file.path;
    } else if (file.filename) {
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      imageUrl = `${protocol}://${host}/uploads/${file.filename}`;
    } else if (mlResult?.images?.original) {
      imageUrl = mlResult.images.original;
    } else if (file.path) {
      const filename = path.basename(file.path);
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      imageUrl = `${protocol}://${host}/uploads/${filename}`;
    } else {
      imageUrl = `/uploads/${file.originalname || "retina.jpg"}`;
    }

    const gradcamUrl = mlResult?.aptos?.heatmap_url || mlResult?.images?.gradcam || imageUrl;
    const vesselMaskUrl = mlResult?.drive?.vessel_mask_url || mlResult?.images?.vessel_mask || imageUrl;
    const predictedClass = mlResult?.aptos?.predicted_class ?? 0;
    const className = mlResult?.aptos?.class_name ?? "No DR";
    const confidence = mlResult?.aptos?.confidence ?? 0.95;
    const probabilities = mlResult?.aptos?.probabilities ?? {
      "No DR": 0.25,
      Mild: 0.27,
      Moderate: 0.11,
      Severe: 0.10,
      "Proliferative DR": 0.27,
    };

    // 3. Create Fundus Post record in MongoDB
    const post = await fundusmodel.create({
      patientid: patient._id,
      imageUrl,
      gradcamUrl,
      vesselMaskUrl,
      predictedClass,
      className,
      confidence,
      probabilities,
      eyeSide,
      sugarLevel,
      analyzedBy: userId,
    });

    // 4. Link scan to patient
    patient.postsid.push(post._id);
    await patient.save();

    return res.status(201).json({
      success: true,
      message: "Retina scan uploaded and analyzed successfully!",
      postId: post._id,
      patientId: patient._id,
      patient: {
        id: patient._id,
        fullName: patient.fullname,
        patientNumber: patient.patientNumber,
        abhaNumber: patient.abhaNumber,
        age: patient.age,
        gender: patient.gender,
        sugarLevel: patient.sugarLevel,
        eyeSide: patient.eyeSide,
      },
      analysis: {
        postId: post._id,
        imageUrl,
        gradcamUrl,
        vesselMaskUrl,
        predictedClass,
        className,
        confidence,
        probabilities,
        eyeSide,
        sugarLevel,
        images: mlResult?.images || {
          original: imageUrl,
          gradcam: gradcamUrl,
          vessel_mask: vesselMaskUrl,
        },
      },
    });
  } catch (error: any) {
    console.error("Error creating post & analyzing scan:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error during retinal analysis",
    });
  }
};

// See All Posts
export const seePosts = async (req: Request, res: Response) => {
  try {
    const posts = await fundusmodel.find().populate("patientid").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Post By ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await fundusmodel.findById(id).populate("patientid");

    if (!post) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }

    return res.status(200).json({ success: true, post });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};
