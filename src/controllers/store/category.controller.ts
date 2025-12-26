import { type Request, type Response } from "express";
import { Category } from "../../models/apps/store/category.model";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const createCategoryController = asyncHandler(async (req: Request, res: Response) => {
    const { title, slug, imageUrl, imagePublicId, description } = req.body ?? {};

    if (!title || !slug || !imageUrl || !imagePublicId) {
        throw new ApiError(400, "title, slug, imageUrl, and imagePublicId are required");
    }

    const normalizedSlug = normalizeSlug(slug);
    const exists = await Category.findOne({ slug: normalizedSlug }).lean();
    if (exists) {
        throw new ApiError(409, "Category with this slug already exists");
    }

    const category = await Category.create({
        title: title.trim(),
        slug: normalizedSlug,
        imageUrl: imageUrl.trim(),
        imagePublicId: imagePublicId.trim(),
        description: description?.trim(),
    });

    res.status(201).json(new ApiResponse(201, category, "Category created"));
});

const updateCategoryController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Category id is required");
    }

    const { title, slug, imageUrl, imagePublicId, description } = req.body ?? {};

    const update: Record<string, unknown> = {};
    if (title) update.title = title.trim();
    if (typeof description === "string") update.description = description.trim();
    if (imageUrl) update.imageUrl = imageUrl.trim();
    if (imagePublicId) update.imagePublicId = imagePublicId.trim();

    if (slug) {
        const normalizedSlug = normalizeSlug(slug);
        const exists = await Category.findOne({ slug: normalizedSlug, _id: { $ne: id } }).lean();
        if (exists) {
            throw new ApiError(409, "Category with this slug already exists");
        }
        update.slug = normalizedSlug;
    }

    if (!Object.keys(update).length) {
        throw new ApiError(400, "No fields provided to update");
    }

    const category = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

const deleteCategoryController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Category id is required");
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    res.status(200).json(new ApiResponse(200, category, "Category deleted"));
});

export { createCategoryController, updateCategoryController, deleteCategoryController };
