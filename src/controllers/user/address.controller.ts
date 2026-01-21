import { type Request, type Response } from "express";
import { User } from "../../models/apps/auth/user.model";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserAddress } from "../../models/apps/user/address.model";

// Add new address
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const address = req.body;
    console.log("Add address called with body:", req.body);
    if (!userId || !address) throw new ApiError(400, "User and address required");
    // Validate required fields from UserAddress schema
    const requiredFields = ["fullName", "phoneNumber", "address", "village", "pincode"];
    for (const field of requiredFields) {
        if (!address[field]) throw new ApiError(400, `Missing required field: ${field}`);
    }
    // Only allow fields from UserAddress schema
    const addressData = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        address: address.address,
        landmarks: address.landmarks,
        village: address.village,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: !!address.isDefault,
    };
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const newAddress = new UserAddress({ ...addressData, user: user._id });
    const savedAddress = await newAddress.save();
    res.status(201).json(new ApiResponse(201, savedAddress, "Address created"));

});

// Edit address
export const editAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { addressId } = req.params;
    const address = req.body;
    if (!userId || !addressId || !address) throw new ApiError(400, "Required fields missing");
    // Only allow fields from UserAddress schema
    const addressData = {
        fullname: address.fullname,
        phoneNumber: address.phoneNumber,
        address: address.address,
        landmarks: address.landmarks,
        village: address.village,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: !!address.isDefault,
    };
    const updated = await UserAddress.findOneAndUpdate(
        { _id: addressId, user: userId },
        addressData,
        { new: true }
    );
    if (!updated) throw new ApiError(404, "Address not found");
    res.status(200).json(new ApiResponse(200, updated, "Address updated"));
});

// Delete address
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { addressId } = req.params;
    if (!userId || !addressId) throw new ApiError(400, "Required fields missing");
    const deleted = await UserAddress.findOneAndDelete({ _id: addressId, user: userId });
    if (!deleted) throw new ApiError(404, "Address not found");
    res.status(200).json(new ApiResponse(200, deleted, "Address deleted"));
});

// Fetch all addresses
export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "User required");
    const addresses = await UserAddress.find({ user: userId });
    res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched"));
});
