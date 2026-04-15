import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import Event from "../models/event.model.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSummary = async (req, res) => {
  try {
    const { worldId } = req.params;
    const { style = "epic" } = req.body || {};

    const events = await Event.find({ worldId });

    if (!events.length) {
      return res.json({
        aiSummary: "🪶 Este mundo aún no tiene historia... pero todo está por comenzar."
      });
    }

    // 🔥 NORMALIZADOR (CLAVE)
    const normalizeType = (type) => {
      if (!type) return "UNKNOWN";

      const t = type.toUpperCase().replace(/\s+/g, "_");

      if (["DEATH", "PLAYER_DEATH"].includes(t)) return "PLAYER_DEATH";
      if (["DIAMOND", "MINED_DIAMOND"].includes(t)) return "MINED_DIAMOND";
      if (t.includes("ZOMBIE")) return "KILL_ZOMBIE";
      if (t.includes("CREEPER")) return "KILL_CREEPER";

      return t;
    };

    // 📊 STATS REALES (USANDO TYPE)
    const deaths = events.filter(e => normalizeType(e.type) === "PLAYER_DEATH").length;
    const diamonds = events.filter(e => normalizeType(e.type) === "MINED_DIAMOND").length;
    const creepers = events.filter(e => normalizeType(e.type) === "KILL_CREEPER").length;
    const zombies = events.filter(e => normalizeType(e.type) === "KILL_ZOMBIE").length;

    const baseSummary = `
Eventos: ${events.length}
Muertes: ${deaths}
Diamantes: ${diamonds}
Creepers: ${creepers}
Zombies: ${zombies}
`;

    // 🎭 ESTILOS
    const styles = {
      epic: "Convertí esto en una narrativa épica estilo Minecraft hardcore.",
      meme: "Convertí esto en un resumen gracioso estilo meme gamer.",
      tecnico: "Convertí esto en un análisis técnico claro y directo.",
      lore: "Convertí esto en una historia tipo fantasía medieval.",
    };

    const prompt = `
${styles[style] || styles.epic}

Resumen:
${baseSummary}

Que sea corto, impactante y con emojis.
`;

    let aiSummary;

    try {
      if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Sos un generador de contenido de Minecraft hardcore." },
            { role: "user", content: prompt }
          ],
          temperature: 0.9,
        });

        aiSummary = completion.choices[0].message.content;
      } else {
        throw new Error("Sin API KEY");
      }

    } catch (error) {
      console.log("⚠️ OpenAI fallback:", error.message);

      // 🆓 MODO GRATIS (MEJORADO)
      const frases = {
        epic: `⚔️ Tras ${events.length} eventos, el héroe consiguió ${diamonds} diamantes y sobrevivió a ${deaths} muertes. La historia continúa...`,
        meme: `💀 ${deaths} muertes, ${diamonds} diamantes... el equilibrio perfecto entre skill y caos 😂`,
        tecnico: `📊 Run Stats → Eventos: ${events.length} | Muertes: ${deaths} | Diamantes: ${diamonds} | Creepers: ${creepers}`,
        lore: `📜 En esta crónica, un aventurero enfrentó ${creepers} criaturas, cayó ${deaths} veces y halló ${diamonds} reliquias legendarias...`
      };

      aiSummary = frases[style] || frases.epic;
    }

    res.json({
      baseSummary,
      aiSummary,
      style
    });

  } catch (error) {
    console.error("❌ ERROR SUMMARY:", error);
    res.status(500).json({ error: "Error generando resumen" });
  }
};