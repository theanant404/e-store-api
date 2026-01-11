import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { ApiError } from "../utils/ApiError";

type UploadParams = {
    folder?: string;
};

type SignedUploadOptions = {
    folder?: string;
    publicId?: string;
    uploadPreset?: string;
    resourceType?: "image" | "auto" | "video" | "raw";
};

export type SignedUploadPayload = {
    uploadUrl: string;
    cloudName: string;
    resourceType: string;
    expiresAt: number;
    fields: {
        api_key: string;
        timestamp: number;
        signature: string;
        folder?: string;
        public_id?: string;
        upload_preset?: string;
    };
};

export type CloudinaryUploadResult = {
    publicId: string;
    url: string;
    secureUrl: string;
    bytes: number;
    format?: string;
    width?: number;
    height?: number;
};

const ensureConfig = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new ApiError(
            500,
            "Cloudinary environment variables are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        );
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
};

const buildSignedUploadPayload = (options: SignedUploadOptions = {}): SignedUploadPayload => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new ApiError(
            500,
            "Cloudinary environment variables are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        );
    }

    const resourceType = options.resourceType ?? "image";
    const uploadPreset = options.uploadPreset ?? CLOUDINARY_UPLOAD_PRESET;
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = { timestamp };
    if (options.folder) paramsToSign.folder = options.folder;
    if (options.publicId) paramsToSign.public_id = options.publicId;
    if (uploadPreset) paramsToSign.upload_preset = uploadPreset;

    const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

    return {
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        cloudName: CLOUDINARY_CLOUD_NAME,
        resourceType,
        expiresAt: timestamp + 600, // 10 minutes buffer for the client to use the signature
        fields: {
            api_key: CLOUDINARY_API_KEY,
            timestamp,
            signature,
            folder: options.folder,
            public_id: options.publicId,
            upload_preset: uploadPreset,
        },
    };
};

const mapResult = (result: UploadApiResponse): CloudinaryUploadResult => ({
    publicId: result.public_id,
    url: result.url ?? "",
    secureUrl: result.secure_url ?? "",
    bytes: result.bytes,
    format: result.format,
    width: result.width,
    height: result.height,
});

const uploadSingle = (file: Express.Multer.File, params?: UploadParams): Promise<CloudinaryUploadResult> => {
    if (!file?.buffer?.length) {
        return Promise.reject(new ApiError(400, "File buffer missing or empty"));
    }

    ensureConfig();

    const folder = params?.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? "bunapi";

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error || !result) {
                    return reject(new ApiError(500, error?.message || "Cloudinary upload failed"));
                }
                resolve(mapResult(result));
            }
        );

        stream.end(file.buffer);
    });
};

const uploadImages = async (files: Express.Multer.File[], params?: UploadParams) => {
    if (!files?.length) {
        throw new ApiError(400, "No files provided for upload");
    }

    const uploads = files.map((file) => uploadSingle(file, params));
    const results = await Promise.all(uploads);
    console.log(`Uploaded ${results.length} images to Cloudinary${params?.folder ? ` in folder '${params.folder}'` : ""}.`);
    return results;
};

const deleteImageByPublicId = async (publicId: string) => {
    if (!publicId) {
        throw new ApiError(400, "publicId is required to delete an asset");
    }

    ensureConfig();

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new ApiError(500, `Failed to delete asset ${publicId}`);
    }

    return result.result;
};

const deleteImagesByPublicIds = async (publicIds: string[]) => {
    if (!publicIds?.length) {
        throw new ApiError(400, "publicIds array is required to delete assets");
    }

    const uniqueIds = Array.from(new Set(publicIds.filter(Boolean)));
    if (!uniqueIds.length) {
        throw new ApiError(400, "At least one valid publicId must be provided");
    }

    ensureConfig();

    const results = await Promise.allSettled(uniqueIds.map((id) => deleteImageByPublicId(id)));
    if (results.length !== uniqueIds.length) {
        throw new ApiError(500, "No deletion results returned from Cloudinary");
    }
    return uniqueIds.map((id, index) => ({
        publicId: id,
        status: results[index]?.status === "fulfilled" ? "deleted" : "failed",
        detail: results[index]?.status === "fulfilled" ? results[index].value : results[index]?.reason?.message,
    }));
};

export { cloudinary, uploadImages, deleteImageByPublicId, deleteImagesByPublicIds, buildSignedUploadPayload };
