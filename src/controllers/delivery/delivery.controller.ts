import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserOrder } from "../../models/apps/user/order.model";

// Get all shipped orders (for delivery partners)
export const getShippedOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        UserOrder.find({ status: 'shipped' })
            .populate('user', 'name email phone')
            .populate('addressId')
            .populate('items.product', 'title')
            .sort({ shippedAt: -1 })
            .limit(Number(limit))
            .skip(skip),
        UserOrder.countDocuments({ status: 'shipped' })
    ]);

    res.status(200).json(new ApiResponse(200, {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    }, "Shipped orders fetched successfully"));
});

// Cancel order (delivery partner)
export const cancelDeliveryOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId || !reason) {
        throw new ApiError(400, "Order ID and reason are required");
    }

    const order = await UserOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== 'shipped') {
        throw new ApiError(400, "Only shipped orders can be cancelled");
    }

    order.status = 'cancelled';
    order.canceledReason = reason;
    order.canceledAt = new Date();
    await order.save();

    res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// Verify OTP and deliver order
export const verifyOtpAndDeliver = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!orderId || !otp) {
        throw new ApiError(400, "Order ID and OTP are required");
    }

    const order = await UserOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== 'shipped') {
        throw new ApiError(400, "Only shipped orders can be delivered");
    }

    // Verify OTP
    if (order.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json(new ApiResponse(200, order, "Order delivered successfully"));
});

// Get order details for delivery (by ID)
export const getDeliveryOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) throw new ApiError(400, "Order ID required");

    const order = await UserOrder.findById(orderId)
        .populate('user', 'name email phone')
        .populate('addressId')
        .populate('items.product', 'title image')
        .populate('items.variety', 'name');

    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== 'shipped') {
        throw new ApiError(400, "Only shipped orders can be viewed for delivery");
    }

    res.status(200).json(new ApiResponse(200, order, "Order details fetched successfully"));
});

// Get all delivered orders
export const getDeliveredOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        UserOrder.find({ status: 'delivered' })
            .populate('user', 'name email phone')
            .populate('addressId')
            .populate('items.product', 'title')
            .sort({ deliveredAt: -1 })
            .limit(Number(limit))
            .skip(skip),
        UserOrder.countDocuments({ status: 'delivered' })
    ]);

    res.status(200).json(new ApiResponse(200, {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    }, "Delivered orders fetched successfully"));
});
