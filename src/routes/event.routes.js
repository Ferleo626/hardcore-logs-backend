import { Router } from "express";
import {
  createEvent,
  getEventsByWorld,
  generateSummary
} from "../controllers/event.controller.js";

import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// 🎮 MOD → SIN AUTH (usa UUID automáticamente)
router.post("/", createEvent);

// 🔐 WEB → CON AUTH
router.post("/secure", authMiddleware, createEvent);

// 📊 RESUMEN DEL MUNDO
router.get("/summary/:worldId", generateSummary);

// 📜 OBTENER EVENTOS
router.get("/:worldId", getEventsByWorld);

export default router;