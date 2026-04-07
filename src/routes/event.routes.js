import { Router } from "express";
import { createEvent, getEventsByWorld } from "../controllers/event.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// 💎 CREAR EVENTO (SIN lógica acá)
router.post("/", authMiddleware, createEvent);

// 📜 OBTENER EVENTOS
router.get("/:worldId", getEventsByWorld);

export default router;
