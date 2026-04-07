import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // ✅ PERMITIR PREFLIGHT (CLAVE)
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("AUTH MIDDLEWARE: No hay header Authorization");
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("AUTH MIDDLEWARE: Token faltante en Authorization");
    return res.status(401).json({ error: "Token faltante" });
  }

  try {
    const decoded = jwt.verify(token, "secreto");
    req.user = decoded;
    console.log("AUTH MIDDLEWARE: Usuario autenticado", req.user);
    next();
  } catch (error) {
    console.log("AUTH MIDDLEWARE: Token inválido", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};