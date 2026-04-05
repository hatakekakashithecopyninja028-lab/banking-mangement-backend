import mongoose, { Document, Schema } from "mongoose";

export interface IRecord extends Document {
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  notes?: string | null;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new Schema<IRecord>(
  {
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Record = mongoose.model<IRecord>("Record", recordSchema);
