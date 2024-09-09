import { Router } from "express";
import {issueReturnBook} from "../controllers/issue&return.controller.js";
import { jwtVerification } from "../middlewares/authJWT.middleware.js";

const router = Router();

router.route("/").post(jwtVerification,issueReturnBook);
export default router;
