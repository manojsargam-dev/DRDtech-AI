import { Schema, model, Document, Types } from "mongoose";

export interface IPatient extends Document {
  fullname: string;
  age: number;
  gender: string;
  contact?: string | undefined;
  patientNumber: string;
  abhaNumber?: string | undefined;
  sugarLevel?: string | number | undefined;
  eyeSide?: string | undefined;
  registeredBy?: Types.ObjectId | undefined;
  postsid: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    fullname: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contact: { type: String, default: "" },
    patientNumber: { type: String, required: true, index: true },
    abhaNumber: { type: String, default: "" },
    sugarLevel: { type: Schema.Types.Mixed, default: "" },
    eyeSide: { type: String, default: "" },
    registeredBy: { type: Schema.Types.ObjectId, ref: "user" },
    postsid: [
      {
        type: Schema.Types.ObjectId,
        ref: "post",
      },
    ],
  },
  { timestamps: true }
);

const patientmodel = model<IPatient>("patient", patientSchema);
export default patientmodel;