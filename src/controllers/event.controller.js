import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// ================================
// CREAR EVENTO (AUTOMÁTICO POR MUNDO)
// ================================
export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO → carpeta: "${folderName}" | user: ${userId}`);

  try {
    // 🔍 Debug de folderName recibido
    console.log("📦 folderName MOD:", folderName);

    // 🔍 Lista de worlds del usuario
    const worlds = await World.find({ user: userId });
    console.log("🌍 WORLDS DB:", worlds.map(w => w.folderName));

    // 🔥 BUSCAR WORLD EXISTENTE
    let world = await World.findOne({ folderName, user: userId });

    // 🚫 SI NO EXISTE → CREAR AUTOMÁTICAMENTE
    if (!world) {
      world = new World({
        name: folderName,       // Nombre visible en la app
        folderName: folderName, // Identificador único
        user: userId,
        active: true,
        status: "activo"
      });
      await world.save();
      console.log(`✅ Nuevo world creado automáticamente → ${folderName}`);
    } else {
      console.log(`✅ Mundo encontrado → ${world.name}`);
    }

    // 🔥 CREAR EVENTO
    const newEvent = new Event({
      type,
      x,
      y,
      z,
      description: description || "Auto detectado desde Minecraft",
      dimension: dimension || "OVERWORLD",
      worldId: world._id
    });

    await newEvent.save();
    console.log(`💾 Evento guardado → ${type} en ${world.name}`);

    // 🔥 EMITIR POR SOCKET.IO
    const io = req.app.get("socketio");
    if (io) {
      io.emit("newEvent", { ...newEvent._doc, worldId: world._id });
      console.log(`🚀 Socket emitido → worldId: ${world._id}`);
    } else {
      console.log("⚠️ Socket.io no disponible");
    }

    res.status(201).json(newEvent);

  } catch (error) {
    console.error("❌ Error en createEvent:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// ================================
// OBTENER EVENTOS POR WORLD
// ================================
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