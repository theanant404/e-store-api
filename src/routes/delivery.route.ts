import { Router } from "express";
import {
    getShippedOrders,
    cancelDeliveryOrder,
    verifyOtpAndDeliver,
    getDeliveryOrderDetails,
    getDeliveredOrders
} from "../controllers/delivery/delivery.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All delivery routes require authentication
router.use(requireAuth);
router.get("/orders", getShippedOrders);
router.get("/orders/delivered", getDeliveredOrders);
router.get("/orders/:orderId", getDeliveryOrderDetails);
router.patch("/orders/:orderId/deliver", verifyOtpAndDeliver);
router.patch("/orders/:orderId/cancel", cancelDeliveryOrder);

export default router;
