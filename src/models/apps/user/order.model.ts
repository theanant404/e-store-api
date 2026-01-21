import mongoose, { Schema, type Document, type Model } from "mongoose";
export interface IUserCart extends Document {
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        variety: mongoose.Types.ObjectId;
        productTitle: string;
        quantity: number;
        price: number;
    }[];
    addressId: mongoose.Types.ObjectId;
    paymentMethod: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    otp?: string;
    canceledReason?: string;
    canceledAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserOrderSchema: Schema<IUserCart> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                variety: { type: Schema.Types.ObjectId, ref: "Variety", required: true },
                productTitle: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        addressId: { type: Schema.Types.ObjectId, ref: "UserAddress", required: true },
        paymentMethod: { type: String, required: true },
        totalAmount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
        otp: { type: String },
        canceledReason: { type: String },
        canceledAt: { type: Date },
        shippedAt: { type: Date },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

export const UserOrder: Model<IUserCart> = mongoose.model<IUserCart>("UserOrder", UserOrderSchema);