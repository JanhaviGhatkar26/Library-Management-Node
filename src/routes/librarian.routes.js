import { Router } from "express";
import {
  registerLibrarian,
  loginLibrarian,
  logoutlibrarian,
} from "../controllers/librarianLog.controller.js";
import { getAllLibrarians,deletedLibrarianById, getLibrarianById, updateLibrarianById} from "../controllers/librarian.controller.js"
import { jwtVerification } from "../middlewares/authJWT.middleware.js";
import signUpVariable  from "../helpers/validation.helper.js";


const router = Router();
router.route("/registerLibrarian").post(signUpVariable,registerLibrarian);
router.route("/loginLibrarian").post(loginLibrarian);
router.route("/logoutLibrarian").post(jwtVerification, logoutlibrarian);

router.route("/getAllLibrarians").get(getAllLibrarians);
router.route("/getLibrarianById/:id").get(jwtVerification, getLibrarianById);
router.route("/deletedLibrarianById/:id").delete(jwtVerification, deletedLibrarianById);
router.route("/updateLibrarianById/:id").patch(jwtVerification,signUpVariable, updateLibrarianById);


export default router;
