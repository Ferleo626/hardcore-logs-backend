import Event from "../models/event.model.js";
import World from "../models/world.model.js";

export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO → carpeta: "${folderName}" | user: ${userId}`);

  try {

    // 🔍 DEBUG REAL
    console.log("📦 folderName MOD:", folderName);

    const worlds = await World.find({ user: userId });
    console.log("🌍 WORLDS DB:", worlds.map(w => w.folderName));

    // 🔥 BUSCAR EXACTO
    let world = await World.findOne({ folderName: folderName, user: userId });

    // 🚫 SI NO EXISTE → BLOQUEAR
    if (!world) {
      console.log("❌ Mundo NO encontrado, evento rechazado");

      return res.status(404).json({
        error: "Mundo no registrado en la app",
        folderNameRecibido: folderName
      });
    }

    console.log(`✅ Mundo encontrado → ${world.name}`);

    // 🔥 CREAR EVENTO
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

    console.log(`💾 EVENTO GUARDADO en ${world.name}`);

    // 🔥 SOCKET
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