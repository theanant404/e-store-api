import { Router } from "express";
import { blockUserController, listUsersController, updateUserRoleController } from "../controllers/admin/user.admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listUsersController);
router.patch("/users/:id/role", updateUserRoleController);
router.patch("/users/:id/block", blockUserController);

export default router;
