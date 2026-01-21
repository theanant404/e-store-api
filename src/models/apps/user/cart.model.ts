import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUserCart extends Document {
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        variety: mongoose.Types.ObjectId;
        quantity: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserCartSchema: Schema<IUserCart> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                variety: { type: Schema.Types.ObjectId, ref: "Variety", required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
    },
    { timestamps: true }
);

export const UserCart: Model<IUserCart> = mongoose.model<IUserCart>("UserCart", UserCartSchema);