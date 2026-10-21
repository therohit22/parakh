import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface IProgress {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  status: "attempted" | "solved";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question reference is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["attempted", "solved"],
    },
  },
  {
    timestamps: true,
    collection: "progress",
  }
);

ProgressSchema.index({ user: 1, question: 1 }, { unique: true });

export const Progress: Model<IProgress> =
  (models.Progress as Model<IProgress>) || model<IProgress>("Progress", ProgressSchema);

export default Progress;
