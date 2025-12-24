import { Router } from "express";
import {
    loginController,
    meController,
    registerController,
    resendEmailOtpController,
    verifyEmailController,
} from "../controllers/auth/auth.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-email-otp", verifyEmailController);
router.post("/resend-email-otp", resendEmailOtpController);
router.get("/me", requireAuth, meController);

export default router;
