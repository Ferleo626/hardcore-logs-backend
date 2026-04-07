import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, default: "" },
  x: Number,
  y: Number,
  z: Number,

  dimension: { 
    type: String, 
    default: "OVERWORLD" 
  },

  worldId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "World", 
    required: true 
  }

}, { timestamps: true });

export default mongoose.model("Event", eventSchema);