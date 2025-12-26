import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
    title: string;
    slug: string;
    description?: string;
    imageUrl: string;
    imagePublicId: string;
}

const categorySchema = new Schema<ICategory>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, trim: true },
        imageUrl: { type: String, required: true, trim: true },
        imagePublicId: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });

export const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
