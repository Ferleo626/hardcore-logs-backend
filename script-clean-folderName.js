import mongoose from "mongoose";
import dotenv from "dotenv";
import World from "./src/models/world.model.js"; // 🔹 Ruta corregida

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB");

  const worlds = await World.find({ folderName: "" });
  console.log("🌍 Worlds con folderName vacío:", worlds.length);

  let count = 0;

  for (const w of worlds) {
    w.folderName = w.name.trim();
    await w.save();
    console.log(`💾 Actualizado: ${w.name} → folderName = "${w.folderName}"`);
    count++;
  }

  console.log(`✅ Total actualizados: ${count}`);
  await mongoose.disconnect();
}

main().catch(err => console.error(err));