import { Router } from "express";
import { createEvent, getEventsByWorld, generateSummary } from "../controllers/event.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// ⚠️ SIEMPRE primero las rutas específicas
router.get("/summary/:worldId", generateSummary);

// 💎 CREAR EVENTO
router.post("/", authMiddleware, createEvent);

// 📜 OBTENER EVENTOS
router.get("/:worldId", getEventsByWorld);

export default router;