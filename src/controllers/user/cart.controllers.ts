import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserCart } from "../../models/apps/user/cart.model";


// Add item to cart
export const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId, varietyId, quantity } = req.body;
    if (!userId || !productId || !varietyId || typeof quantity !== "number" || quantity < 1) {
        throw new ApiError(400, "Invalid input data");
    }

    let cart = await UserCart.findOne({ user: userId });
    if (!cart) {
        cart = new UserCart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId && item.variety.toString() === varietyId
    );

    if (
        existingItemIndex > -1 &&
        cart.items &&
        cart.items[existingItemIndex]
    ) {
        cart.items[existingItemIndex].quantity += quantity;
    } else if (cart.items) {
        cart.items.push({ product: productId, variety: varietyId, quantity });
    }

    await cart.save();
    res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

// Get user cart
export const getUserCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "User ID required");

    const cart = await UserCart.findOne({ user: userId }).populate("items.product").populate("items.variety");
    res.status(200).json(new ApiResponse(200, cart || { items: [] }, "User cart fetched"));
});

// Remove item from cart
export const removeItemFromCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId, varietyId } = req.body;
    if (!userId || !productId || !varietyId) {
        throw new ApiError(400, "Invalid input data");
    }

    const cart = await UserCart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        (item) => !(item.product.toString() === productId && item.variety.toString() === varietyId)
    );

    await cart.save();
    res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

// Clear user cart
export const clearUserCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "User ID required");

    const cart = await UserCart.findOneAndDelete({ user: userId });
    res.status(200).json(new ApiResponse(200, cart, "User cart cleared"));
});
