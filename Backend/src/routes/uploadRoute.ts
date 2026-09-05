import { Router } from "express";
import { createPost, seePosts, getPostById } from "../controllers/uploadController.ts";
import upload from "../middleware/upload.ts";

const router = Router();

// Allow either "imageUrl", "image", or "file" field name
const fileUpload = upload.fields([
  { name: "imageUrl", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const normalizeFile = (req: any, res: any, next: any) => {
  if (req.files) {
    if (req.files.imageUrl && req.files.imageUrl[0]) {
      req.file = req.files.imageUrl[0];
    } else if (req.files.image && req.files.image[0]) {
      req.file = req.files.image[0];
    } else if (req.files.file && req.files.file[0]) {
      req.file = req.files.file[0];
    }
  }
  next();
};

router.post("/create", fileUpload, normalizeFile, createPost);
router.post("/scan", fileUpload, normalizeFile, createPost);
router.post("/", fileUpload, normalizeFile, createPost);
router.get("/posts", seePosts);
router.get("/", seePosts);
router.get("/:id", getPostById);

export default router;
