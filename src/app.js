import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

import worldRoutes from "./routes/world.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// ✅ 1. CORS CONFIGURADO PARA NAVEGADOR Y MOD
app.use(cors({
  origin: [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://TU-FRONTEND.onrender.com"
],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ 2. CREAR SERVIDOR HTTP + SOCKET
const httpServer = createServer(app);

// ✅ SOCKET CON CORS (FRONT + MOD)
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
  },
  transports: ["websocket", "polling"]
});

// ✅ 3. GUARDAR SOCKET EN EXPRESS
app.set("socketio", io);

// ✅ 4. CONECTAR DB
connectDB();

// ✅ 5. LOG DE PETICIONES
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

// ✅ 6. RUTAS
app.use("/api/worlds", worldRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// ✅ 7. SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// ✅ 8. LEVANTAR SERVIDOR
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});