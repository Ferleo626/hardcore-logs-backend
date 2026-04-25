import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// ===============================
// 🧠 NORMALIZADORES
// ===============================

// 🔥 limpia "_" al final (SIN romper nada)
const normalizeFolder = (name) => {
  if (!name) return null;

  return name
    .trim()
    .replace(/_+$/, ""); // solo elimina "_" final
};

// 🌍 normaliza dimensión
const normalizeDimension = (dim) => {
  if (!dim) return "OVERWORLD";

  if (dim.toLowerCase().includes("nether")) return "THE_NETHER";
  if (dim.toLowerCase().includes("end")) return "THE_END";

  return "OVERWORLD";
};

// ===============================
// 📡 CREAR EVENTO (ESTABLE)
// ===============================
export const createEvent = async (req, res) => {
  try {
    const {
      type,
      folderName,
      x,
      y,
      z,
      description,
      dimension,
      player
    } = req.body;

    // 🔐 user opcional (NO rompe si no hay auth)
    const userId = req.user?.id;

    const cleanFolder = normalizeFolder(folderName);

    if (!cleanFolder) {
      return res.status(400).json({ error: "folderName inválido" });
    }

    console.log("📥 EVENT:", req.body);
    console.log("👤 USER:", req.user);

    // ===========================
    // 🔍 BUSCAR MUNDO
    // ===========================
    let world = null;

    if (userId) {
      world = await World.findOne({
        user: userId,
        folderName: cleanFolder
      });
    } else {
      // fallback si no hay auth (modo antiguo)
      world = await World.findOne({
        folderName: cleanFolder
      });
    }

    // ===========================
    // 🚀 CREAR MUNDO SI NO EXISTE
    // ===========================
    if (!world) {
      console.log(`🔧 Creando mundo: "${cleanFolder}"`);

      world = await World.create({
        name: cleanFolder,
        folderName: cleanFolder,
        user: userId || null,
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