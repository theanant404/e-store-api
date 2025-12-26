import { Router } from "express";
import { addVarietyController, deleteVarietyController, updateVarietyController } from "../controllers/store/variety.controller";
import { requireAuth } from "../middleware/auth";

const router = Router({ mergeParams: true });

// These routes expect :productId in the path when mounted
router.post("/", requireAuth, addVarietyController);
router.put("/:varietyId", requireAuth, updateVarietyController);
router.delete("/:varietyId", requireAuth, deleteVarietyController);

export default router;
