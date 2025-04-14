import express from "express";
import { getMessages, sendMessage, getMessage, updateMessage, deleteMessage } from "../controllers/message.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
    .get(protect, getMessages)
    .post(protect, sendMessage)

router.route("/:id")
    .get(protect, getMessage)
    .put(protect, updateMessage)
    .delete(protect, deleteMessage)


export default router;

