import express from "express";
import World from "../models/world.model.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// 🌍 Crear mundo
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newWorld = new World({
      ...req.body,
      user: req.user.id,
      active: false,
    });

    await newWorld.save();
    res.json(newWorld);
  } catch (error) {
    res.status(500).json({ error: "Error al crear mundo" });
  }
});

// 📦 Obtener mundos del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const worlds = await World.find({ user: req.user.id });
    res.json(worlds);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mundos" });
  }
});

// 🔍 Obtener mundo por ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const world = await World.findById(req.params.id);

    if (!world) {
      return res.status(404).json({ error: "Mundo no encontrado" });
    }

    res.json(world);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 ACTIVAR MUNDO
router.put("/activate/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await World.updateMany(
      { user: userId },
      { active: false }
    );

    const world = await World.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    );

    res.json(world);
  } catch (error) {
    res.status(500).json({ error: "Error al activar mundo" });
  }
});

// 🗑️ ELIMINAR MUNDO
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await World.findByIdAndDelete(req.params.id);

    res.json({ message: "Mundo eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar mundo:", error);
    res.status(500).json({ error: "Error al eliminar el mundo" });
  }
});

export default router;