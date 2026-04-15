import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// 🔐 Cargar variables de entorno PRIMERO
dotenv.config();
console.log("API KEY:", process.env.OPENAI_API_KEY);

// 📦 Imports internos
import { connectDB } from "./config/db.js";
import worldRoutes from "./routes/world.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";
import summaryRoutes from "./routes/summary.routes.js";

const app = express();

// ✅ Validación clave API (te ahorra errores silenciosos)
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Falta OPENAI_API_KEY en .env");
  process.exit(1);
}

// 🌍 CORS CONFIG
const allowedOrigins = [
  "https://hardcorelogs.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS bloqueado"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// 🧠 Middlewares base
app.use(express.json());

// 📡 HTTP + SOCKET.IO
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("socketio", io);

// 🗄️ DB
connectDB();

// 🧾 Logger simple
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// 🧪 Health check
app.get("/", (req, res) => {
  res.send("🔥 Hardcore Logs backend activo");
});

// 🚀 Rutas API
app.use("/api/worlds", worldRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/summary", summaryRoutes);

// 🔌 Socket eventos
io.on("connection", (socket) => {
  console.log("✅ Socket conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket desconectado:", socket.id);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});