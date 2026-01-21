import { Router } from "express";
import { blockUserController, listUsersController, updateUserRoleController } from "../controllers/admin/user.admin.controller";
import { deleteOrder, getAllOrders, getOrderByIdAdmin, getOrderStats, updateOrderStatus } from "../controllers/admin/order.admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

// User management routes
router.get("/users", listUsersController);
router.patch("/users/:id/role", updateUserRoleController);
router.patch("/users/:id/block", blockUserController);

// Order management routes
router.get("/orders", getAllOrders);
router.get("/orders/stats", getOrderStats);
router.get("/orders/:orderId", getOrderByIdAdmin);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.delete("/orders/:orderId", deleteOrder);

export default router;
