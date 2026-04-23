import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.model.js";
import World from "../models/world.model.js";
import LinkToken from "../models/linkToken.model.js";


// =========================
// ❌ REGISTER (DESHABILITADO)
// =========================
export const register = async (req, res) => {
  return res.status(403).json({
    error: "Registro deshabilitado. Usa Minecraft login."
  });
};


// =========================
// ❌ LOGIN WEB (DESHABILITADO)
// =========================
export const login = async (req, res) => {
  return res.status(403).json({
    error: "Login web deshabilitado. Usa Minecraft."
  });
};


// =========================
// 🎮 LOGIN DESDE MOD (ÚNICO SISTEMA REAL)
// =========================
export const minecraftLogin = async (req, res) => {
  try {
    const { uuid, username, folderName } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: "UUID requerido" });
    }

    let user = await User.findOne({ uuid });

    if (!user) {
      user = await User.create({
        uuid,
        username: username || "Jugador"
      });
    }

    // 🌍 crear mundo si viene folderName
    if (folderName) {
      let world = await World.findOne({
        user: user._id,
        folderName
      });

      if (!world) {
        await World.create({
          name: folderName,
          folderName,
          user: user._id,
          active: true
        });
      }
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      username: user.username,
      uuid: user.uuid
    });

  } catch (error) {
    console.error("❌ minecraftLogin:", error);
    res.status(500).json({ error: "Error en login mod" });
  }
};


// =========================
// 🔥 LINK TOKEN (MOD → WEB LOGIN)
// =========================
export const generateLinkToken = async (req, res) => {
  try {
    const { uuid, username } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: "UUID requerido" });
    }

    let user = await User.findOne({ uuid });

    if (!user) {
      user = await User.create({ uuid, username });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await LinkToken.create({
      token,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 1000)
    });

    res.json({
      url: `https://hardcorelogs.vercel.app/link/${token}`
    });

  } catch (error) {
    console.error("❌ generateLinkToken:", error);
    res.status(500).json({ error: "Error generando link" });
  }
};


// =========================
// 🔥 CONSUMIR LINK (LOGIN WEB)
// =========================
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

    res.redirect(
      `https://hardcorelogs.vercel.app/auth-success?token=${jwtToken}`
    );

  } catch (error) {
    console.error("❌ consumeLinkToken:", error);
    res.status(500).send("Error");
  }
};