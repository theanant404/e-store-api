import { type Request, type Response } from "express";
import { deleteImageByPublicId, deleteImagesByPublicIds, uploadImages } from "../../lib/cloudinary";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const uploadImagesController = asyncHandler(async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];
    const folder = typeof req.body?.folder === "string" && req.body.folder.trim().length > 0
        ? req.body.folder.trim()
        : undefined;

    if (!files.length) {
        throw new ApiError(400, "No images provided. Use form-data field 'images'.");
    }

    const uploads = await uploadImages(files, { folder });
    res.status(201).json(new ApiResponse(201, { count: uploads.length, assets: uploads }, "Images uploaded"));
});

const deleteImageController = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
        throw new ApiError(400, "publicId param is required");
    }

    const result = await deleteImageByPublicId(publicId);
    res.status(200).json(new ApiResponse(200, { result, publicId }, "Image deleted"));
});

const deleteImagesBulkController = asyncHandler(async (req: Request, res: Response) => {
    const publicIds = Array.isArray(req.body?.publicIds)
        ? req.body.publicIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : [];

    if (!publicIds.length) {
        throw new ApiError(400, "publicIds must be a non-empty string array");
    }

    const results = await deleteImagesByPublicIds(publicIds);
    res.status(200).json(new ApiResponse(200, { count: results.length, results }, "Images processed"));
});

export { uploadImagesController, deleteImageController, deleteImagesBulkController };
