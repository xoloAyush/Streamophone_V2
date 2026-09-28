import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";
import {getConversations, getChat, sendMessage} from '../controllers/chat.controller.js'

const router = express.Router();

router.get("/token", protect, getStreamToken);

router.get("/conversations", protect, getConversations);
// router.get("/conversations/:id/messages", protect, getMessages);
router.get("/:friendId", protect, getChat);
// router.get("/:friendId", protect, getStreamToken);
// router.put("/messages/:id/seen", protect, getStreamToken);

router.post("/messages", protect, sendMessage);


export default router;