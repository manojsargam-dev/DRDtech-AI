import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  patientid: Types.ObjectId;
  imageUrl: string;
  gradcamUrl?: string | undefined;
  vesselMaskUrl?: string | undefined;
  predictedClass?: number | undefined;
  className?: string | undefined;
  confidence?: number | undefined;
  probabilities?: {
    noDR?: number | undefined;
    mild?: number | undefined;
    moderate?: number | undefined;
    severe?: number | undefined;
    proliferative?: number | undefined;
    [key: string]: number | undefined;
  } | undefined;
  eyeSide?: string | undefined;
  sugarLevel?: string | number | undefined;
  analyzedBy?: Types.ObjectId | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    patientid: {
      type: Schema.Types.ObjectId,
      ref: "patient",
      required: true,
    },
    imageUrl: { type: String, required: true },
    gradcamUrl: { type: String, default: "" },
    vesselMaskUrl: { type: String, default: "" },
    predictedClass: { type: Number },
    className: { type: String },
    confidence: { type: Number },
    probabilities: { type: Schema.Types.Mixed },
    eyeSide: { type: String, default: "" },
    sugarLevel: { type: Schema.Types.Mixed, default: "" },
    analyzedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

const fundusmodel = model<IPost>("post", postSchema);
export default fundusmodel;
