import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface IBookmark {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
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
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

export const Bookmark: Model<IBookmark> =
  (models.Bookmark as Model<IBookmark>) || model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;
