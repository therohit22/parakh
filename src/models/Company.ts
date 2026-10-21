import mongoose, { Schema, type Model } from "mongoose";

const models = mongoose.models;
const model = mongoose.model.bind(mongoose);

export interface ICompany {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    logo: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },
    website: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ name: 1 });

export const Company: Model<ICompany> =
  (models.Company as Model<ICompany>) || model<ICompany>("Company", CompanySchema);

export default Company;
