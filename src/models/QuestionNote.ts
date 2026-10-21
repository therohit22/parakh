import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface IQuestionNote {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionNoteSchema = new Schema<IQuestionNote>(
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
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      maxlength: [2000, "Note content cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
    collection: "question_notes",
  }
);

QuestionNoteSchema.index({ user: 1, question: 1 }, { unique: true });

export const QuestionNote: Model<IQuestionNote> =
  (models.QuestionNote as Model<IQuestionNote>) ||
  model<IQuestionNote>("QuestionNote", QuestionNoteSchema);

export default QuestionNote;
