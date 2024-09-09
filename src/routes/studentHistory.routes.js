import { Router } from "express";
import { getStudentHistory } from "../controllers/studenthistory.controller.js";
const router = Router();

router.route("/:id").get(getStudentHistory);

export default router;