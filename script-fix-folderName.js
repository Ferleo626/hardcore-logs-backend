import mongoose from "mongoose";
import dotenv from "dotenv";
import World from "./src/models/world.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ No se encontró MONGO_URI en .env");
  process.exit(1);
}

async function fixFolderNames() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    const worlds = await World.find({});
    console.log(`🌍 Worlds encontrados: ${worlds.length}`);

    let updated = 0;

    for (const world of worlds) {
      if (!world.folderName || world.folderName.trim() === "") {
        world.folderName = world.name;
        await world.save();
        console.log(`💾 Actualizado: ${world.name} → folderName = "${world.folderName}"`);
        updated++;
      }
    }

    console.log(`✅ Total actualizados: ${updated}`);
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.disconnect();
  }
}

fixFolderNames();