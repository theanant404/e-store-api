import mongoose, { Schema, type Document, type Model } from "mongoose";
/**
 *   final String fullName;
  final String phoneNumber;
  final String address;
  final String landmarks;
  final String village;
  final String pincode;
  final double? latitude;
  final double? longitude;
  final bool isDefault;
 */
export interface IAddress extends Document {
    fullName: string;
    phoneNumber: string;
    address: string;
    landmarks: string;
    village: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
    user: mongoose.Types.ObjectId;
}
const addressSchema = new Schema<IAddress>(
    {
        fullName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        landmarks: { type: String, trim: true },
        village: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        latitude: { type: Number, optional: true, trim: true },
        longitude: { type: Number },
        isDefault: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    },
    { timestamps: true }
);

export const UserAddress: Model<IAddress> =
    mongoose.models.UserAddress || mongoose.model<IAddress>("UserAddress", addressSchema);