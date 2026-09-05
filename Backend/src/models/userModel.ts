import {Schema,model,Document} from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
export interface userid extends Document {
  email: string;
  fullname: string;
  password: string;
  phone: string;
  workerid: string;
  healthcenter: string;
  region: string;
  resetPasswordToken?: string | undefined;
  resetPasswordExpire?: number | undefined;
  comparePassword(candidate: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<userid>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    workerid: { type: String, required: true, unique: true },
    healthcenter: { type: String, required: true },
    region: { type: String, required: true },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpire: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

//  Pre-save hook: hash password if modified
userSchema.pre<userid>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});


//  Compare password method
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

//  Create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return rawToken;
};

//  Hide sensitive fields in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};


const usermodel = model<userid>("user",userSchema);
export default usermodel;