import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IVariety extends Document {
    product: Types.ObjectId;
    price: number;
    discount?: number;
    stock: number;
    weight?: number;
    quantity?: number;
    unit?: string;
}

const varietySchema = new Schema<IVariety>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        stock: { type: Number, required: true, min: 0 },
        weight: { type: Number, min: 0 },
        quantity: { type: Number, min: 0 },
        unit: { type: String, trim: true },
    },
    { timestamps: true }
);

export const Variety: Model<IVariety> =
    mongoose.models.Variety || mongoose.model<IVariety>("Variety", varietySchema);
