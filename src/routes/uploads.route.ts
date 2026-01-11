import { Router } from "express";
import { deleteImageController, deleteImagesBulkController, getSignedUploadController } from "../controllers/uploads/uploads.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/sign", requireAuth, getSignedUploadController);
router.delete("/", requireAuth, deleteImagesBulkController); // accepts body.publicIds: string[]
router.delete("/:publicId", requireAuth, deleteImageController);

export default router;
