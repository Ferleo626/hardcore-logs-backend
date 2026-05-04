import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // 🌐 WEB
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },

  // 🎮 MOD
  uuid: {
    type: String,
    unique: true,
    sparse: true,
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