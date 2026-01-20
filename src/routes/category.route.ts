import { Router } from "express";
import { createCategoryController, getCategoryAllController, deleteCategoryController, updateCategoryController } from "../controllers/store/category.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getCategoryAllController);
router.post("/", requireAuth, createCategoryController);
router.put("/:id", requireAuth, updateCategoryController);
router.delete("/:id", requireAuth, deleteCategoryController);

export default router;


