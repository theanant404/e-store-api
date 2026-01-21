import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserOrder } from "../../models/apps/user/order.model";


// Create a new order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { items, totalAmount, addressId, paymentMethod } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0 || typeof totalAmount !== "number" || !addressId) {
        throw new ApiError(400, "Invalid input data");
    }

    // Transform items to match the model schema
    const transformedItems = items.map((item: any) => ({
        product: item.productId,
        variety: item.varietyId,
        productTitle: item.productTitle,
        quantity: item.quantity,
        price: item.price,
    }));

    const order = await UserOrder.create({
        user: userId,
        items: transformedItems,
        totalAmount,
        addressId,
        paymentMethod: paymentMethod || "cod",
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
    });

    res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});

// Get user orders
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "User ID required");

    const orders = await UserOrder.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, orders, "User orders fetched"));
});

// Get order by ID
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { orderId } = req.params;
    if (!userId || !orderId) throw new ApiError(400, "User ID and Order ID required");

    const order = await UserOrder.findOne({ _id: orderId, user: userId });
    if (!order) throw new ApiError(404, "Order not found");

    res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Cancel order
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { reason } = req.body;
    if (!userId || !orderId || !reason) throw new ApiError(400, "User ID, Order ID and reason required");

    const order = await UserOrder.findOne({ _id: orderId, user: userId });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status === "cancelled") throw new ApiError(400, "Order is already cancelled");

    order.status = "cancelled";
    order.canceledReason = reason;
    order.canceledAt = new Date();
    await order.save();

    res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});
// update order status (for admin use)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!orderId || !status || !validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid input data");
    }

    const order = await UserOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    order.status = status as any;
    if (status === 'shipped') {
        order.shippedAt = new Date();
    } else if (status === 'delivered') {
        order.deliveredAt = new Date();
    }
    await order.save();

    res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

