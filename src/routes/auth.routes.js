import express from "express";
import { register, login, minecraftLogin } from "../controllers/auth.controller.js";
import { generateLinkToken, consumeLinkToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/link-token", generateLinkToken);
router.get("/link/:token", consumeLinkToken);

// 🎮 LOGIN AUTOMÁTICO DESDE EL MOD
router.post("/minecraft", minecraftLogin);


export default router;