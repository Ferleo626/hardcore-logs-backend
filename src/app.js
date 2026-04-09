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

// ✅ 1. CONFIGURACIÓN DE CORS GLOBAL (Versión Final con dominios explícitos)
const allowedOrigins = [
  'https://hardcorelogs.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite solicitudes sin origin (como tu Mod) o que estén en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS No permitido por seguridad"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// ✅ 2. SERVER HTTP & SOCKET.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Socket.io usa los mismos dominios
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("socketio", io);

// ✅ 3. CONEXIÓN A BASE DE DATOS
connectDB();

// ✅ 4. MIDDLEWARE DE LOGS
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