import Event from "../models/event.model.js";
import World from "../models/world.model.js";

// 1️⃣ FUNCIÓN PARA CREAR EVENTOS (La que usa el Mod de Minecraft)
export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO RECIBIDO → carpeta: "${folderName}" | user: ${userId}`);

  try {
    // 1. BUSCAR MUNDO POR CARPETA
    let world = await World.findOne({ folderName: folderName, user: userId });

    if (world) {
      console.log(`🔗 VÍNCULO EXISTENTE → ${folderName} → ${world.name}`);
    }

    // 2. SI NO EXISTE → USAR MUNDO ACTIVO Y VINCULAR
    if (!world) {
      console.log("🔍 No existe vínculo. Buscando mundo activo...");
      world = await World.findOne({ active: true, user: userId });

      if (world) {
        world.folderName = folderName;
        await world.save();
        console.log(`✅ Vinculada carpeta "${folderName}" al mundo "${world.name}"`);
      }
    }

    // 3. SI NO HAY MUNDO → ERROR (EVITA EL VALIDATION ERROR)
    if (!world) {
      console.log("❌ ERROR: No hay mundo activo para vincular.");
      return res.status(404).json({
        error: "No hay mundo activo para vincular."
      });
    }

    // 4. CREAR EVENTO CON EL ID SEGURO
  const newEvent = new Event({
  type,
  x,
  y,
  z,
  description: description || "Auto detectado",
  
  // 🔥 NUEVO CAMPO
  dimension: dimension || "OVERWORLD",

  worldId: world._id
});
    await newEvent.save();
    console.log(`💾 EVENTO GUARDADO → ${type} en ${world.name}`);

    // 5. EMISIÓN POR SOCKET.IO
    const io = req.app.get("socketio");
    if (io) {
      io.emit("newEvent", {
        ...newEvent._doc,
        worldId: world._id
      });
      console.log(`🚀 SOCKET EMITIDO → worldId: ${world._id}`);
    } else {
      console.log("⚠️ Socket.io no disponible");
    }

    res.status(201).json(newEvent);

  } catch (error) {
    console.error("❌ Error en createEvent:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// 2️⃣ FUNCIÓN PARA OBTENER EVENTOS
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
