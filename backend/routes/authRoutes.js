import express from "express";
import { changeAuthenticatedPassword, currentAccount, forgotPassword, login, requestAuthenticatedPasswordOtp, resetPassword, verifyAdminLoginOtp, verifyPasswordResetOtp } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin/verify-login-otp", verifyAdminLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, changeAuthenticatedPassword);
router.post("/change-password/email-otp", authenticate, requestAuthenticatedPasswordOtp);
router.get("/me", authenticate, currentAccount);

export default router;
