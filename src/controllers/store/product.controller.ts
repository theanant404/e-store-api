import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { Category } from "../../models/apps/store/category.model";
import { Product } from "../../models/apps/store/product.model";
import { Variety } from "../../models/apps/store/variety.model";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const validateObjectId = (id: string) => Types.ObjectId.isValid(id);

const createProductController = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, category, images, varieties } = req.body ?? {};

    if (!title || !category || !Array.isArray(images) || !images.length) {
        throw new ApiError(400, "title, category, and images[] are required");
    }

    if (!validateObjectId(category)) {
        throw new ApiError(400, "Invalid category id");
    }

    const categoryDoc = await Category.findById(category).lean();
    if (!categoryDoc) {
        throw new ApiError(404, "Category not found");
    }

    const formattedImages = images
        .filter((img: any) => img && typeof img.url === "string" && typeof img.publicId === "string")
        .map((img: any) => ({ url: img.url.trim(), publicId: img.publicId.trim() }));

    if (!formattedImages.length) {
        throw new ApiError(400, "images must include url and publicId for each item");
    }

    const product = await Product.create({
        title: title.trim(),
        description: description?.trim(),
        category,
        images: formattedImages,
        varietyIds: [],
    });

    // Create varieties if provided
    if (Array.isArray(varieties) && varieties.length) {
        const payloads = varieties
            .filter((v: any) => v && typeof v.price === "number" && typeof v.stock === "number")
            .map((v: any) => ({
                product: product._id,
                price: v.price,
                discount: typeof v.discount === "number" ? v.discount : 0,
                stock: v.stock,
                weight: typeof v.weight === "number" ? v.weight : undefined,
                quantity: typeof v.quantity === "number" ? v.quantity : undefined,
                unit: typeof v.unit === "string" ? v.unit.trim() : undefined,
            }));

        if (payloads.length) {
            const created = await Variety.insertMany(payloads);
            product.varietyIds = created.map((v) => v._id);
            await product.save();
        }
    }

    const productWithVarieties = await Product.findById(product._id)
        .populate("category")
        .populate("varietyIds")
        .lean();

    res.status(201).json(new ApiResponse(201, productWithVarieties, "Product created"));
});

const updateProductController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !validateObjectId(id)) {
        throw new ApiError(400, "Valid product id is required");
    }

    const { title, description, category, images } = req.body ?? {};

    const update: Record<string, unknown> = {};
    if (title) update.title = title.trim();
    if (typeof description === "string") update.description = description.trim();

    if (category) {
        if (!validateObjectId(category)) {
            throw new ApiError(400, "Invalid category id");
        }
        const cat = await Category.findById(category).lean();
        if (!cat) throw new ApiError(404, "Category not found");
        update.category = category;
    }

    if (Array.isArray(images)) {
        const formattedImages = images
            .filter((img: any) => img && typeof img.url === "string" && typeof img.publicId === "string")
            .map((img: any) => ({ url: img.url.trim(), publicId: img.publicId.trim() }));
        if (!formattedImages.length) {
            throw new ApiError(400, "images must include url and publicId for each item");
        }
        update.images = formattedImages;
    }

    if (!Object.keys(update).length) {
        throw new ApiError(400, "No fields provided to update");
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true })
        .populate("category")
        .populate("varietyIds");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(new ApiResponse(200, product, "Product updated"));
});

const deleteProductController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !validateObjectId(id)) {
        throw new ApiError(400, "Valid product id is required");
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Clean up varieties linked to this product
    await Variety.deleteMany({ product: product._id });

    res.status(200).json(new ApiResponse(200, product, "Product deleted"));
});

const listProductsController = asyncHandler(async (_req: Request, res: Response) => {
    const products = await Product.find()
        .populate("category")
        .populate("varietyIds")
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, products, "Products fetched"));
});

export {
    createProductController,
    updateProductController,
    deleteProductController,
    listProductsController,
};
