import { Router } from "express";
import { jwtVerification } from "../middlewares/authJWT.middleware.js";
import {
  addNewStudent,
  getAllStudent,
  getStudentById,
  DeleteStudentById,
  updateStudentById,
} from "../controllers/student.controller.js";
import signUpVariable from "../helpers/validation.helper.js";
// import {storage} from "./middlewares/uoloadPhoto.middleware.js"

const router = Router();


router.route("/getAllStudents").get(getAllStudent);
router.route("/addNewStudent").post(jwtVerification,signUpVariable, addNewStudent);
router.route("/updateStudentById/:id").patch(jwtVerification, signUpVariable, updateStudentById);
router.route("/getStudentById/:id").get(getStudentById);
router.route("/DeleteStudentById/:id").delete(jwtVerification,DeleteStudentById);

export default router;
