import { Router } from "express";
import { addAddress, editAddress, deleteAddress, getAddresses } from "../controllers/user/address.controller";
import { addItemToCart, clearUserCart, getUserCart, removeItemFromCart } from "../controllers/user/cart.controllers";

import { requireAuth } from "../middleware/auth";
const router = Router();

// Add new address
router.post("/address", requireAuth, addAddress);
router.put("/address/:addressId", requireAuth, editAddress);
router.delete("/address/:addressId", requireAuth, deleteAddress);
router.get("/address", requireAuth, getAddresses);
// cart routes 
router.post("/cart", requireAuth, addItemToCart);
router.get("/cart", requireAuth, getUserCart);
router.delete("/cart/item", requireAuth, removeItemFromCart);
router.delete("/cart", requireAuth, clearUserCart);

export default router;
