import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {

  // ✅ permitir preflight
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("❌ No Authorization header");
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ Token faltante");
    return res.status(401).json({ error: "Token faltante" });
  }

  try {
    console.log("🔐 TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 🔥 FIX

    console.log("✅ TOKEN VÁLIDO:", decoded);

    req.user = decoded;
    next();

  } catch (error) {
    console.log("❌ JWT ERROR:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};