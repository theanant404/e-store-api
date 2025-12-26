import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IProductImage {
    url: string;
    publicId: string;
}

export interface IProduct extends Document {
    title: string;
    description?: string;
    category: Types.ObjectId;
    images: IProductImage[];
    varietyIds: Types.ObjectId[];
}

const imageSchema = new Schema<IProductImage>(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const productSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
        images: { type: [imageSchema], default: [] },
        varietyIds: [{ type: Schema.Types.ObjectId, ref: "Variety", default: [] }],
    },
    { timestamps: true }
);

productSchema.index({ title: 1, category: 1 }, { unique: true });

export const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
