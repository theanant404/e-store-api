import { Router } from "express";
import { addAddress, editAddress, deleteAddress, getAddresses } from "../controllers/user/address.controller";
import { requireAuth } from "../middleware/auth";
const router = Router();

// Add new address
router.post("/address", requireAuth, addAddress);
router.put("/address/:addressId", requireAuth, editAddress);
router.delete("/address/:addressId", requireAuth, deleteAddress);
router.get("/address", requireAuth, getAddresses);

export default router;
