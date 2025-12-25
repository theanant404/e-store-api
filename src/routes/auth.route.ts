import { Router } from "express";
import {
    loginController,
    loginWithOtpController,
    meController,
    registerController,
    resendEmailOtpController,
    requestPasswordResetController,
    resetPasswordWithOtpController,
    verifyEmailController,
} from "../controllers/auth/auth.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/login-otp", loginWithOtpController);
router.post("/verify-email-otp", verifyEmailController);
router.post("/resend-email-otp", resendEmailOtpController);
router.post("/forgot-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordWithOtpController);
router.get("/me", requireAuth, meController);

export default router;
