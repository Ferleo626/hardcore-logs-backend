import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import cors from "cors"; // 🔥 1. Importar cors oficial

import worldRoutes from "./routes/world.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

// ✅ 2. CONFIGURACIÓN DE CORS PROFESIONAL
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://hardcorelogs.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir pedidos sin origen (como apps móviles o curl) o en la lista permitida
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- EL RESTO DE TU CÓDIGO (httpServer, Socket, DB, etc.) SE MANTIENE IGUAL ---

// ✅ SOCKET
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // 🔥 3. Usar los mismos orígenes para el socket
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ DB
connectDB();

// ✅ LOG
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// ✅ RUTAS
app.use("/api/worlds", worldRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// ✅ PORT
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});