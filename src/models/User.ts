import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: "student" | "admin";
  bookmarkedQuestions?: mongoose.Types.ObjectId[];
  solvedQuestions?: mongoose.Types.ObjectId[];
  revisionQuestions?: mongoose.Types.ObjectId[];
  activityLog?: { date: string; count: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    bookmarkedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    solvedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    revisionQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    activityLog: [
      {
        date: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);

export default User;
