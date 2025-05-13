import express from "express";
import {
  createTag,
  getTags,
  updateTag,
  getTagById,
  deleteTag,
} from "../controllers/tag.controller.js";

const router = express.Router();

router.post("/", createTag);
router.get("/", getTags);
router.get("/:id", getTagById);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

export default router;
