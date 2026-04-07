import fs from "fs";
import path from "path";
import nbt from "prismarine-nbt";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // Cambialo a tu backend
}); 

// Ruta de mundo de Minecraft (Java Edition)
const WORLD_PATH = "C:/Users/TuUsuario/AppData/Roaming/.minecraft/saves/MiMundo/level.dat";

const readWorld = async () => {
  try {
    const data = fs.readFileSync(WORLD_PATH);
    const parsed = nbt.parse(data); 

    const worldData = parsed.value;

    // Ejemplo: nombre del mundo y spawn point
    const worldName = path.basename(path.dirname(WORLD_PATH)); // nombre carpeta
    const spawnX = worldData.Data.value.SpawnX.value;
    const spawnY = worldData.Data.value.SpawnY.value;
    const spawnZ = worldData.Data.value.SpawnZ.value;

    console.log("Nombre del mundo:", worldName);
    console.log("Spawn:", spawnX, spawnY, spawnZ);

    // Enviar a API
    await API.post("/worlds", {
      name: worldName,
      spawn: { x: spawnX, y: spawnY, z: spawnZ },
    });

    console.log("Mundo enviado a la API ✅");

  } catch (err) {
    console.error("Error leyendo el mundo:", err);
  }
};

readWorld();