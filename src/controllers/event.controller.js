import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// Función para normalizar dimensión
const normalizeDimension = (dim) => {
  if (!dim) return "OVERWORLD";

  if (dim.includes("nether") || dim === "NETHER") return "THE_NETHER";
  if (dim.includes("end") || dim === "END") return "THE_END";

  return "OVERWORLD";
};

export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO → carpeta: "${folderName}" | user: ${userId}`);

  try {
    // 🔥 BUSCAR MUNDO EXACTO
    let world = await World.findOne({ folderName: folderName, user: userId });

    // 🚀 SI NO EXISTE → CREAR AUTOMÁTICO
    if (!world) {
      console.log(`🔧 Mundo "${folderName}" no encontrado → creando automáticamente`);
      world = new World({
        name: folderName,         // Nombre del mundo
        folderName: folderName,   // folderName igual al nombre
        user: userId,
        active: true,
        status: "activo"
      });
      await world.save();
      console.log(`✅ Mundo creado → ${world.name}`);
    }

    // 🔥 CREAR EVENTO
    const newEvent = new Event({
      type,
      x,
      y,
      z,
      description: description || "Auto detectado",
      dimension: normalizeDimension(dimension), // <-- cambio aplicado aquí
      worldId: world._id
    });

    await newEvent.save();
    console.log(`💾 EVENTO GUARDADO en ${world.name}`);

    // 🔥 EMITIR POR SOCKET
    const io = req.app.get("socketio");
    if (io) {
      io.emit("newEvent", {
        ...newEvent._doc,
        worldId: world._id
      });
      console.log(`🚀 SOCKET EMITIDO → worldId: ${world._id}`);
    }

    res.status(201).json(newEvent);

  } catch (error) {
    console.error("❌ Error en createEvent:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

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