import mongoose from "mongoose";

const worldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // 👤 Usuario dueño del mundo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🌍 Mundo activo
    active: {
      type: Boolean,
      default: false,
    },

    // 💀 Estado del mundo
    status: {
      type: String,
      enum: ["activo", "muerto"],
      default: "activo",
    },

    folderName: {
      type: String,
      default: "", 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("World", worldSchema);