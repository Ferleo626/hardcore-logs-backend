import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true 
  },
  player: { 
    type: String, 
    default: "Desconocido" 
  },
  description: { 
    type: String, 
    default: "" 
  },
  x: { type: Number },
  y: { type: Number },
  z: { type: Number },
  dimension: { 
    type: String, 
    default: "OVERWORLD" 
  },
  worldId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'World', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);