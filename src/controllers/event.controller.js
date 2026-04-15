export const generateSummary = async (req, res) => {
  const { worldId } = req.params;

  try {
    // 🔥 Obtener eventos del mundo
    const events = await Event.find({ worldId });

    // 🔥 Contadores
    const deaths = events.filter(e => e.type === "DEATH").length;
    const diamonds = events.filter(e => e.type === "DIAMOND").length;

    // (opcional) otros stats
    const overworld = events.filter(e => e.dimension === "OVERWORLD").length;
    const nether = events.filter(e => e.dimension === "THE_NETHER").length;
    const end = events.filter(e => e.dimension === "THE_END").length;

    // 🔥 Resumen
    const summary = `
Sobreviviste ${events.length} eventos.
Encontraste ${diamonds} diamantes 💎.
Moriste ${deaths} veces 💀.

Exploración:
🌍 Overworld: ${overworld}
🔥 Nether: ${nether}
🟣 End: ${end}
`;

    res.json({ summary });

  } catch (error) {
    console.error("❌ Error en generateSummary:", error);
    res.status(500).json({ error: "Error al generar resumen" });
  }
};