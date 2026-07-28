import express from "express";
import { currentAccount, login } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticate, currentAccount);

export default router;
