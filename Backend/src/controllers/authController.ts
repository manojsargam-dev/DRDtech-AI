import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import usermodel from "../models/userModel.ts";
import jwt, { type SignOptions } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

const signToken = (email: string, userid: any): string => {
  const secret = process.env.SECRET || "retinal_ai_default_secret_key_2026";
  const expiresIn = process.env.EXPIRES || "7d";
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign({ email, userid }, secret, options);
};

// Register new Healthcare Worker / User
export const createuser = async (req: Request, res: Response) => {
  try {
    const fullname = req.body.fullName || req.body.fullname;
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;
    const phone = String(req.body.phone || "");
    const workerid = String(req.body.workerId || req.body.workerid || "");
    const healthcenter = req.body.phc || req.body.healthcenter || "General PHC";
    const region = req.body.region || "Default Region";

    if (!email || !password || !fullname) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please log in.",
      });
    }

    if (workerid) {
      const existingWorker = await usermodel.findOne({ workerid });
      if (existingWorker) {
        return res.status(400).json({
          success: false,
          message: "Worker ID / Badge Number is already registered.",
        });
      }
    }

    const newUser = await usermodel.create({
      fullname,
      email,
      password, // Pre-save hook hashes with bcrypt
      phone: phone || "0000000000",
      workerid: workerid || `HW-${Date.now()}`,
      healthcenter,
      region,
    });

    const token = signToken(newUser.email, newUser._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registered and logged in successfully!",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        workerId: newUser.workerid,
        phc: newUser.healthcenter,
        region: newUser.region,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to register user",
    });
  }
};

// Login Healthcare Worker / User
export const logined = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user.email, user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone,
        workerId: user.workerid,
        phc: user.healthcenter,
        region: user.region,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error during login",
    });
  }
};

// Get Current User Profile (for session restoration)
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userid;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone,
        workerId: user.workerid,
        phc: user.healthcenter,
        region: user.region,
      },
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email?.trim()?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }

    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/api/auth/reset-password/${rawToken}`;
    console.log("Password Reset link generated:", resetUrl);

    return res.json({
      success: true,
      message: "Reset link generated. Check server log.",
      resetUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};

// Reset Password 
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "Invalid reset token" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await usermodel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link invalid or expired" });
    }

    user.password = password; // pre-save hook will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};

export const htMl = async (req: Request, res: Response) => {
  const { token } = req.params;
  const resetUrl = `/api/auth/reset-password/${token}`;
  res.render("Passwordrest", { resetUrl });
};