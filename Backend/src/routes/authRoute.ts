import { Router } from "express";
import {
  createuser,
  logined,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  htMl,
} from "../controllers/authController.ts";
import { isloggined } from "../middleware/isloggined.ts";

const router = Router();

// Standard REST endpoints
router.post("/register", createuser);
router.post("/createuser", createuser); // Alias

router.post("/login", logined);
router.post("/check", logined); // Alias (without isloggined blocker)

router.get("/me", isloggined, getCurrentUser);
router.get("/logout", logout);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/:token", htMl);

// Protected health check test route
router.get("/protected", isloggined, (req, res) => {
  const user = (req as any).user;
  res.json({
    success: true,
    message: "You have access!",
    user,
  });
});

export default router;
