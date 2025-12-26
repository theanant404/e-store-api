import { Router } from "express";
import {
    createProductController,
    deleteProductController,
    listProductsController,
    updateProductController,
} from "../controllers/store/product.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createProductController);
router.put("/:id", requireAuth, updateProductController);
router.delete("/:id", requireAuth, deleteProductController);
router.get("/", listProductsController);

export default router;
