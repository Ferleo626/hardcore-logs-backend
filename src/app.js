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

// ✅ LISTA DE ORÍGENES PERMITIDOS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://hardcorelogs.vercel.app"
];

// ✅ CONFIG CORS COMPLETA
app.use(cors({
  origin: function (origin, callback) {
    // permite requests sin origin (Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ✅ IMPORTANTE: responder preflight
app.options("*", cors());

app.use(express.json());

// ✅ SERVER HTTP
const httpServer = createServer(app);

// ✅ SOCKET
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set("socketio", io);

// ✅ DB
connectDB();

// ✅ LOG
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
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