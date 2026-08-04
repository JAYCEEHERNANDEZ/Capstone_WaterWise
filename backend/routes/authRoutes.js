import express from "express";
import { changeAuthenticatedPassword, completeConsumerEmailChange, currentAccount, forgotPassword, login, requestAuthenticatedPasswordOtp, requestConsumerEmailChangeOtp, requestStaffActionOtp, resetPassword, verifyAdminLoginOtp, verifyConsumerEmailChangeOtp, verifyPasswordResetOtp, verifyStaffActionOtp } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin/verify-login-otp", verifyAdminLoginOtp);
router.post("/admin/staff-action/otp", authenticate, requestStaffActionOtp);
router.post("/admin/staff-action/verify", authenticate, verifyStaffActionOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, changeAuthenticatedPassword);
router.post("/change-password/email-otp", authenticate, requestAuthenticatedPasswordOtp);
router.post("/consumer/change-email/otp", authenticate, requestConsumerEmailChangeOtp);
router.post("/consumer/change-email/verify", authenticate, verifyConsumerEmailChangeOtp);
router.post("/consumer/change-email", authenticate, completeConsumerEmailChange);
router.post("/admin/change-email/otp", authenticate, requestConsumerEmailChangeOtp);
router.post("/admin/change-email/verify", authenticate, verifyConsumerEmailChangeOtp);
router.post("/admin/change-email", authenticate, completeConsumerEmailChange);
router.get("/me", authenticate, currentAccount);

export default router;
