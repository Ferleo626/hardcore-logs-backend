import mongoose from "mongoose";

const linkTokenSchema = new mongoose.Schema({
  token: String,
  userId: mongoose.Schema.Types.ObjectId,
  expiresAt: Date
});

export default mongoose.model("LinkToken", linkTokenSchema);