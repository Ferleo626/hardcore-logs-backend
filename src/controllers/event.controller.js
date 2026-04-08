import Event from "../models/event.model.js";
import World from "../models/world.model.js";

export const createEvent = async (req, res) => {
  const { type, folderName, x, y, z, description, dimension } = req.body;
  const userId = req.user.id;

  console.log(`📡 EVENTO → carpeta: "${folderName}" | user: ${userId}`);

  try {
    // Limpiar folderName de espacios
    const cleanFolder = folderName.trim();

    // Buscar mundo exacto
    let world = await World.findOne({ folderName: cleanFolder, user: userId });

    // Si no existe → crear automáticamente
    if (!world) {
      console.log(`🌱 Mundo no encontrado. Creando automáticamente: "${cleanFolder}"`);

      world = await World.findOneAndUpdate(
        { folderName: cleanFolder, user: userId },
        { 
          $setOnInsert: {
            name: cleanFolder,
            folderName: cleanFolder,
            user: userId,
            active: true,
            status: "activo",
          }
        },
        { new: true, upsert: true }
      );

      console.log(`✅ Mundo creado automáticamente: "${world.name}"`);

      // Desactivar otros mundos activos
      await World.updateMany(
        { user: userId, _id: { $ne: world._id } },
        { active: false }
      );
    }

    // Crear evento
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

    // Emitir por socket
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