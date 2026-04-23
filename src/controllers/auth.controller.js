import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.model.js";
import World from "../models/world.model.js";
import LinkToken from "../models/linkToken.model.js";

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

// 🔑 LOGIN NORMAL (WEB)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password incorrecto" });
    }

    let world = await World.findOne({ user: user._id, active: true });

    if (!world) {
      world = await World.findOne({ user: user._id })
        .sort({ createdAt: -1 });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      worldId: world ? world._id.toString() : ""
    });

  } catch (error) {
    console.error("🔥 ERROR LOGIN:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// 🎮 LOGIN AUTOMÁTICO DESDE EL MOD
export const minecraftLogin = async (req, res) => {
  try {
    const { uuid, username, folderName } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: "UUID requerido" });
    }

    let user = await User.findOne({ uuid });

    // 🧑 Crear usuario si no existe
    if (!user) {
      user = new User({
        uuid,
        username: username || "Jugador"
      });
      await user.save();
    }

    // 🌍 CREAR MUNDO AUTOMÁTICO SI VIENE folderName
    if (folderName) {
      let world = await World.findOne({
        user: user._id,
        folderName: folderName
      });

      if (!world) {
        world = new World({
          name: folderName,
          folderName: folderName,
          user: user._id,
          active: true
        });

        await world.save();
        console.log("🌍 Mundo creado en login:", folderName);
      }
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token });

  } catch (error) {
    console.error("❌ minecraftLogin:", error);
    res.status(500).json({ error: "Error en login automático" });
  }
};

// 🔥 GENERAR LINK TOKEN (desde el mod)
export const generateLinkToken = async (req, res) => {
  try {
    const { uuid, username } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: "UUID requerido" });
    }

    let user = await User.findOne({ uuid });

    // 🚀 crear usuario si no existe
    if (!user) {
      user = new User({ uuid, username });
      await user.save();
    }

    const token = crypto.randomBytes(32).toString("hex");

    await LinkToken.create({
      token,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 1000) // ⏳ 30s
    });

    res.json({
      url: `https://hardcorelogs.vercel.app/link/${token}`
    });

  } catch (error) {
    console.error("❌ generateLinkToken:", error);
    res.status(500).json({ error: "Error generando link" });
  }
};

// 🔥 CONSUMIR LINK (login automático en web)
export const consumeLinkToken = async (req, res) => {
  try {
    const { token } = req.params;

    const link = await LinkToken.findOne({ token });

    if (!link || link.expiresAt < new Date()) {
      return res.status(400).send("Token inválido o expirado");
    }

    const jwtToken = jwt.sign(
      { id: link.userId },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await LinkToken.deleteOne({ token });

    // 🔥 redirect con sesión
    res.redirect(
      `https://hardcorelogs.vercel.app/auth-success?token=${jwtToken}`
    );

  } catch (error) {
    console.error("❌ consumeLinkToken:", error);
    res.status(500).send("Error");
  }
};