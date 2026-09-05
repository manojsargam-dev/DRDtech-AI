import type { Request, Response } from "express";
import patientmodel from "../models/patientModel.ts";

interface AuthRequest extends Request {
  user?: any;
}

export const createOrUpdatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const fullname = req.body.fullname || req.body.fullName;
    const patientNumber = String(req.body.patientNumber || req.body.Patient || `PT-${Date.now()}`);
    const abhaNumber = String(req.body.abhaNumber || "");
    const age = Number(req.body.age || req.body.Age || 0);
    const gender = req.body.gender || req.body.Gender || "Other";
    const sugarLevel = req.body.sugarLevel || req.body.Glucose || "";
    const contact = String(req.body.contact || req.body.phone || req.body.Contact || "");
    const eyeSide = req.body.eyeSide || req.body.eye || "";
    const userId = req.user?.userid;

    if (!fullname) {
      return res.status(400).json({ success: false, message: "Patient full name is required" });
    }

    let patient = await patientmodel.findOne({ patientNumber });

    if (patient) {
      patient.fullname = fullname;
      patient.age = age;
      patient.gender = gender;
      patient.contact = contact || patient.contact;
      patient.abhaNumber = abhaNumber || patient.abhaNumber;
      patient.sugarLevel = sugarLevel || patient.sugarLevel;
      patient.eyeSide = eyeSide || patient.eyeSide;
      if (userId && !patient.registeredBy) {
        patient.registeredBy = userId;
      }

      await patient.save();

      return res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        patientId: patient._id,
        patient,
      });
    } else {
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

      return res.status(201).json({
        success: true,
        message: "New patient created successfully",
        patientId: patient._id,
        patient,
      });
    }
  } catch (error: any) {
    console.error("Error creating/updating patient:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await patientmodel.find().populate("postsid").sort({ updatedAt: -1 });
    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch patients" });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await patientmodel.findById(id).populate("postsid");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    return res.status(200).json({ success: true, patient });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};
