import { Router } from "express";
import {
  createOrUpdatePatient,
  getAllPatients,
  getPatientById,
} from "../controllers/patientController.ts";
import { isloggined } from "../middleware/isloggined.ts";

const router = Router();

router.post("/info", createOrUpdatePatient);
router.post("/", createOrUpdatePatient);
router.get("/", getAllPatients);
router.get("/:id", getPatientById);

export default router;