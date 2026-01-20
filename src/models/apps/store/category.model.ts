import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
    title: string;
    slug: string;
    description?: string;
    imageUrl: string;
}

const categorySchema = new Schema<ICategory>(
    {
        title: { type: String, required: true, trim: true, index: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        description: { type: String, trim: true },
        imageUrl: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);


export const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
