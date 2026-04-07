import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import World from "../models/world.model.js"; 

// 🔐 REGISTER
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "Usuario creado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// 🔑 LOGIN COMPATIBLE CON EL MOD 🎮
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    // 2. Validar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password incorrecto" });
    }

    // 3. Buscar mundo ACTIVO
    let world = await World.findOne({ user: user._id, active: true });

    // 4. Si no hay activo → buscar último creado
    if (!world) {
      world = await World.findOne({ user: user._id })
        .sort({ createdAt: -1 });
    }

    // ⚠️ NO creamos mundo automático
    // solo usamos el que exista

    // 5. Token
    const token = jwt.sign(
      { id: user._id },
      "secreto",
      { expiresIn: "30d" } // más largo para el mod
    );

    res.json({
      token: token,
      worldId: world ? world._id.toString() : ""
    });

  } catch (error) {
    console.error("🔥 ERROR LOGIN:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};