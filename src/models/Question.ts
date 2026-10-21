import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string;
  companies: mongoose.Types.ObjectId[];
  leetcodeUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      default: undefined,
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: ["Easy", "Medium", "Hard"],
    },
    topics: {
      type: [String],
      default: [],
    },
    pattern: {
      type: String,
      trim: true,
      default: undefined,
    },
    companies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
    leetcodeUrl: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ companies: 1 });
QuestionSchema.index({ topics: 1 });
QuestionSchema.index({ pattern: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ createdAt: -1 });

export const Question: Model<IQuestion> =
  (models.Question as Model<IQuestion>) || model<IQuestion>("Question", QuestionSchema);

export default Question;
