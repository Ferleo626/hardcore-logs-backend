import { Router } from "express";
import {
  createEvent,
  createEventFromMod,
  getEventsByWorld,
  generateSummary
} from "../controllers/event.controller.js";

import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// 🎮 MOD → sin auth (UUID automático)
router.post("/", createEventFromMod);

// 🔐 WEB → con auth
router.post("/secure", authMiddleware, createEvent);

// 📊 RESUMEN DEL MUNDO
router.get("/summary/:worldId", generateSummary);

// 📜 OBTENER EVENTOS
router.get("/:worldId", getEventsByWorld);

export default router;