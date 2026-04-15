import express from "express";
import { generateSummary } from "../controllers/summary.controller.js";

const router = express.Router();

router.post("/:worldId", generateSummary);

export default router;