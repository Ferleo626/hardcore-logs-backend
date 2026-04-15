import OpenAI from "openai";
import Event from "../models/event.model.js"; // ajustá si tu ruta es distinta

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSummary = async (req, res) => {
  try {
    const { worldId } = req.params;
    const { style = "epic" } = req.body; // epic | meme | tecnico | lore

    const events = await Event.find({ world: worldId });

    if (!events.length) {
      return res.status(404).json({ error: "No hay eventos para este mundo" });
    }

    // 📊 STATS BASE
    const deaths = events.filter(e => e.type === "DEATH").length;
    const diamonds = events.filter(e => e.type === "DIAMOND").length;
    const creepers = events.filter(e => e.type === "CREEPER").length;
    const zombies = events.filter(e => e.type === "ZOMBIE").length;

    const baseSummary = `
Eventos totales: ${events.length}
Muertes: ${deaths}
Diamantes: ${diamonds}
Creepers: ${creepers}
Zombies: ${zombies}
`;

    // 🎭 PROMPTS POR ESTILO
    const styles = {
      epic: "Convertí esto en una narrativa épica estilo videojuego hardcore.",
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

    // 🤖 LLAMADA A IA
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // rápido y barato
      messages: [
        { role: "system", content: "Sos un generador de contenido de Minecraft hardcore." },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
    });

    const aiSummary = completion.choices[0].message.content;

    res.json({
      baseSummary,
      aiSummary,
      style
    });

  } catch (error) {
    console.error("ERROR SUMMARY:", error);
    res.status(500).json({ error: "Error generando resumen" });
  }
};