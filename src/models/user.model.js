import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // 🌐 LOGIN WEB (opcional)
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },

  // 🎮 LOGIN AUTOMÁTICO (MOD)
  uuid: {
    type: String,
    unique: true,
    sparse: true
  },
  username: {
    type: String
  }

}, {
  timestamps: true
});


export default mongoose.model("User", userSchema);
