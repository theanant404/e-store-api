import { type Request, type Response } from "express";
import { buildSignedUploadPayload, deleteImageByPublicId, deleteImagesByPublicIds } from "../../lib/cloudinary";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const getSignedUploadController = asyncHandler(async (req: Request, res: Response) => {
    const folder = typeof req.body?.folder === "string" && req.body.folder.trim().length > 0
        ? req.body.folder.trim()
        : undefined;
    const publicId = typeof req.body?.publicId === "string" && req.body.publicId.trim().length > 0
        ? req.body.publicId.trim()
        : undefined;
    const uploadPreset = typeof req.body?.uploadPreset === "string" && req.body.uploadPreset.trim().length > 0
        ? req.body.uploadPreset.trim()
        : undefined;
    const resourceType = typeof req.body?.resourceType === "string" && req.body.resourceType.trim().length > 0
        ? req.body.resourceType.trim()
        : "image";
    // console.log("Generating signed upload payload with params:", { folder, publicId, uploadPreset, resourceType });
    const signedPayload = buildSignedUploadPayload({ folder, publicId, uploadPreset, resourceType });

    res.status(200).json(new ApiResponse(200, signedPayload, "Signed upload payload generated"));
});

const deleteImageController = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
        throw new ApiError(400, "publicId param is required");
    }

    const result = await deleteImageByPublicId(publicId);
    res.status(200).json(new ApiResponse(200, { result, publicId }, "Image deleted"));
});



export { getSignedUploadController, deleteImageController };
