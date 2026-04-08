import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// 1️⃣ CREAR EVENTO
export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO RECIBIDO → carpeta: "${folderName}" | user: ${userId}`);

  try {
    // 🔥 1. BUSCAR MUNDO POR folderName + user
    let world = await World.findOne({ folderName, user: userId });

    // 🔥 2. SI NO EXISTE → CREAR NUEVO (NO usar active)
    if (!world) {
      console.log(`🆕 Creando nuevo mundo para carpeta: ${folderName}`);

      world = await World.create({
        name: folderName,       // nombre visible
        folderName: folderName, // clave real
        user: userId,
        active: false
      });
    }

    // 🔥 3. CREAR EVENTO
    const newEvent = new Event({
      type,
      x,
      y,
      z,
      description: description || "Auto detectado",
      dimension: dimension || "OVERWORLD",
      worldId: world._id
    });

    await newEvent.save();
    console.log(`💾 EVENTO GUARDADO → ${type} en ${world.name}`);

    // 🔥 4. SOCKET
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

// 2️⃣ OBTENER EVENTOS
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