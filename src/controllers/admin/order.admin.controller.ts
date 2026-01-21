import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserOrder } from "../../models/apps/user/order.model";
import mongoose from "mongoose";

// Get all orders (admin)
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
        query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        UserOrder.find(query)
            .populate('user', 'name email')
            .populate('addressId')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip),
        UserOrder.countDocuments(query)
    ]);

    res.status(200).json(new ApiResponse(200, {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    }, "Orders fetched successfully"));
});

// Get order by ID (admin)
export const getOrderByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) throw new ApiError(400, "Order ID required");

    const order = await UserOrder.findById(orderId)
        .populate('user', 'name email phone')
        .populate('addressId')
        .populate('items.product')
        .populate('items.variety');

    if (!order) throw new ApiError(404, "Order not found");

    res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update order status (admin)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    // console.log(orderId);
    const data = req.body;
    // console.log(data.status);
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!orderId || !data.status || !validStatuses.includes(data.status)) {
        throw new ApiError(400, "Invalid input data");
    }

    const order = await UserOrder.findById(new mongoose.Types.ObjectId(orderId));
    // console.log("orders", order);
    if (!order) throw new ApiError(404, "Order not found");
    // update status
    order.status = data.status
    await order.save();
    res.status(200).json(new ApiResponse(200, order.status, "Order status updated successfully"));
});

// Delete order (admin)
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) throw new ApiError(400, "Order ID required");

    const order = await UserOrder.findByIdAndDelete(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    res.status(200).json(new ApiResponse(200, null, "Order deleted successfully"));
});

// Get order statistics (admin)
export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserOrder.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$totalAmount" }
            }
        }
    ]);

    const totalOrders = await UserOrder.countDocuments();
    const totalRevenue = await UserOrder.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.status(200).json(new ApiResponse(200, {
        stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
    }, "Order statistics fetched successfully"));
});
