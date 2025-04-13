import express from "express";
import { getChats , getGroupChats , createChat , createGroupChat , getChat , updateChat, addToGroup , deleteChat , getMessagesChat } from "../controllers/chat.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
    .get(protect, getChats)
    .post(protect, createChat)

router.route("/group")
    .get(protect, getGroupChats)
    .post(protect, createGroupChat)

router.route("/group/add")
    .put(protect, addToGroup)

router.route("/:id")
    .get(protect,  getChat)
    .put(protect,  updateChat)
    .delete(protect, deleteChat)

router.route("/:id/messageschat")
    .get(protect, getMessagesChat)

export default router;

