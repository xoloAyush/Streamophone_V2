import express from "express";
import {
    createAgent,
    getAgent,
    chatWithAgent,
    getAgents,
    deleteAgent,
    getAgentConversation
} from "../controllers/agent.controller.js";
import {
    runAgentTests,
} from "../controllers/agent-evaluation.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",protect, createAgent);
router.get("/", protect, getAgents);

router.post("/tests/run", protect, runAgentTests);

router.get("/:id",protect, getAgent);
router.post("/:id/chat", protect, chatWithAgent);

router.get(
    "/:id/chat",
    protect,
    getAgentConversation
);

router.delete("/:agentId", protect, deleteAgent);

export default router;