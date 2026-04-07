import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import cors from "cors"; 

import worldRoutes from "./routes/world.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

// ✅ 1. CONFIGURACIÓN DE CORS GLOBAL (Versión Final)
app.use(cors({
  origin: function (origin, callback) {
    // Permitir si no hay origen (como el Mod de MC), localhost o cualquier subdominio de Vercel
    if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("CORS No permitido por seguridad"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ 2. SERVER HTTP & SOCKET.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Permite que el socket conecte desde cualquier lado
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("socketio", io);

// ✅ 3. CONEXIÓN A BASE DE DATOS
connectDB();

// ✅ 4. MIDDLEWARE DE LOGS (Para ver los errores en la consola de Render)
app.use((req, res, next) => {
  console.log(`📩 Solicitud: ${req.method} ${req.url}`);
  next();
});

// ✅ 5. RUTA DE TEST
app.get("/", (req, res) => {
  res.send("Backend de Hardcore Logs funcionando 🚀");
});

// ✅ 6. DEFINICIÓN DE RUTAS API
app.use("/api/worlds", worldRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// ✅ 7. EVENTOS DE SOCKET
io.on("connection", (socket) => {
  console.log("✅ Cliente socket conectado:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Cliente socket desconectado");
  });
});

// ✅ 8. ARRANQUE DEL SERVIDOR
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor volando en el puerto ${PORT}`);
});