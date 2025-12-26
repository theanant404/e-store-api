import { Router } from "express";
import { createCategoryController, deleteCategoryController, updateCategoryController } from "../controllers/store/category.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createCategoryController);
router.put("/:id", requireAuth, updateCategoryController);
router.delete("/:id", requireAuth, deleteCategoryController);

export default router;
