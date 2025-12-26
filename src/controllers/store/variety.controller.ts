import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { Product } from "../../models/apps/store/product.model";
import { Variety } from "../../models/apps/store/variety.model";
import { asyncHandler } from "../../utils/AsyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const validateObjectId = (id: string) => Types.ObjectId.isValid(id);

const addVarietyController = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { price, discount, stock, weight, quantity, unit } = req.body ?? {};

    if (!productId || !validateObjectId(productId)) {
        throw new ApiError(400, "Valid productId is required");
    }

    if (typeof price !== "number" || typeof stock !== "number") {
        throw new ApiError(400, "price and stock must be numbers");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const variety = await Variety.create({
        product: product._id,
        price,
        discount: typeof discount === "number" ? discount : 0,
        stock,
        weight: typeof weight === "number" ? weight : undefined,
        quantity: typeof quantity === "number" ? quantity : undefined,
        unit: typeof unit === "string" ? unit.trim() : undefined,
    });

    product.varietyIds.push(variety._id);
    await product.save();

    res.status(201).json(new ApiResponse(201, variety, "Variety added"));
});

const updateVarietyController = asyncHandler(async (req: Request, res: Response) => {
    const { productId, varietyId } = req.params;
    if (!validateObjectId(productId!) || !validateObjectId(varietyId!)) {
        throw new ApiError(400, "Valid productId and varietyId are required");
    }

    const variety = await Variety.findOne({ _id: varietyId, product: productId });
    if (!variety) {
        throw new ApiError(404, "Variety not found for this product");
    }

    const { price, discount, stock, weight, quantity, unit } = req.body ?? {};

    if (price !== undefined) variety.price = price;
    if (discount !== undefined) variety.discount = discount;
    if (stock !== undefined) variety.stock = stock;
    if (weight !== undefined) variety.weight = weight;
    if (quantity !== undefined) variety.quantity = quantity;
    if (unit !== undefined) variety.unit = typeof unit === "string" ? unit.trim() : unit;

    await variety.save();

    res.status(200).json(new ApiResponse(200, variety, "Variety updated"));
});

const deleteVarietyController = asyncHandler(async (req: Request, res: Response) => {
    const { productId, varietyId } = req.params;
    if (!validateObjectId(productId!) || !validateObjectId(varietyId!)) {
        throw new ApiError(400, "Valid productId and varietyId are required");
    }

    const variety = await Variety.findOneAndDelete({ _id: varietyId, product: productId });
    if (!variety) {
        throw new ApiError(404, "Variety not found for this product");
    }

    await Product.findByIdAndUpdate(productId, { $pull: { varietyIds: variety._id } });

    res.status(200).json(new ApiResponse(200, variety, "Variety deleted"));
});

export { addVarietyController, updateVarietyController, deleteVarietyController };
