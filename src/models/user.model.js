import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  // 🎮 ÚNICO IDENTIFICADOR (Minecraft)
  uuid: {
    type: String,
    unique: true,
    required: true
  },

  username: {
    type: String,
    default: "Jugador"
  }

}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);