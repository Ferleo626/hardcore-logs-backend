import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// ===============================
// 🧠 NORMALIZADORES
// ===============================

// 🔥 limpia folderName (SOLUCIÓN CLAVE)
const normalizeFolder = (name) => {
  if (!name) return null;

  return name
    .trim()
    .replace(/_+$/, "") // ❌ elimina "_" al final
    .replace(/\s+/g, " "); // limpia espacios raros
};

// 🌍 normaliza dimensión
const normalizeDimension = (dim) => {
  if (!dim) return "OVERWORLD";

  if (dim.toLowerCase().includes("nether")) return "THE_NETHER";
  if (dim.toLowerCase().includes("end")) return "THE_END";

  return "OVERWORLD";
};

// ===============================
// 📡 CREAR EVENTO
// ===============================
export const createEvent = async (req, res) => {
  try {
    const { type, folderName, x, y, z, description, dimension, player } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      console.error("❌ SIN USER EN TOKEN");
      return res.status(401).json({ error: "No autorizado" });
    }

    const cleanFolder = normalizeFolder(folderName);

    if (!cleanFolder) {
      return res.status(400).json({ error: "folderName inválido" });
    }

    console.log(`📡 EVENTO → "${cleanFolder}" | user: ${userId}`);

    // ===========================
    // 🔍 BUSCAR MUNDO NORMALIZADO
    // ===========================
    let world = await World.findOne({
      user: userId,
      folderName: cleanFolder
    });

    // ===========================
    // 🚀 CREAR SI NO EXISTE
    // ===========================
    if (!world) {
      console.log(`🔧 Creando mundo limpio: "${cleanFolder}"`);

      world = await World.create({
        name: cleanFolder,
        folderName: cleanFolder,
        user: userId,
        active: true,
        status: "activo"
      });
    }

    // ===========================
    // 💾 CREAR EVENTO
    // ===========================
    const newEvent = await Event.create({
      type,
      player: player || "Desconocido",
      x,
      y,
      z,
      description: description || "Auto detectado",
      dimension: normalizeDimension(dimension),
      worldId: world._id
    });

    console.log(`💾 EVENTO GUARDADO → ${world.name}`);

    // ===========================
    // 🚀 SOCKET
    // ===========================
    const io = req.app.get("socketio");
    if (io) {
      io.emit("newEvent", {
        ...newEvent._doc,
        worldId: world._id
      });
    }

    res.status(201).json(newEvent);

  } catch (error) {
    console.error("❌ Error en createEvent:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// ===============================
// 📊 OBTENER EVENTOS POR MUNDO
// ===============================
export const getEventsByWorld = async (req, res) => {
  const { worldId } = req.params;

  try {
    const events = await Event.find({ worldId }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("❌ Error en getEventsByWorld:", error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

// ===============================
// 🧾 RESUMEN DEL MUNDO
// ===============================
export const generateSummary = async (req, res) => {
  const { worldId } = req.params;

  try {
    const events = await Event.find({ worldId });

    const deaths = events.filter(e => e.type.includes("DEATH")).length;
    const diamonds = events.filter(e => e.type.includes("DIAMOND")).length;

    const summary = `
Sobreviviste ${events.length} eventos.
Encontraste ${diamonds} diamantes 💎.
Moriste ${deaths} veces 💀.
    `.trim();

    res.json({ summary });

  } catch (error) {
    console.error("❌ Error en generateSummary:", error);
    res.status(500).json({ error: "Error al generar resumen" });
  }
};