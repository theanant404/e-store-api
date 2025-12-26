import { Router } from "express";
import multer from "multer";
import { deleteImageController, deleteImagesBulkController, uploadImagesController } from "../controllers/uploads/uploads.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Use memory storage so we can stream buffers directly to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        // 5 MB per image; adjust as needed
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});

router.post("/", requireAuth, upload.array("images", 4), uploadImagesController);
router.delete("/", requireAuth, deleteImagesBulkController); // accepts body.publicIds: string[]
router.delete("/:publicId", requireAuth, deleteImageController);

export default router;
