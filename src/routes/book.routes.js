import { Router } from "express";
import {addNewBook,deleteBookById,getAllBooks,getBookById, updateBookById} from "../controllers/book.controller.js";
import { jwtVerification } from "../middlewares/authJWT.middleware.js";

const router = Router();
router.route("/addNewBook").post(jwtVerification,addNewBook);
router.route("/deleteBookById/:id").delete(jwtVerification,deleteBookById);
router.route("/").get(getAllBooks);                           
router.route("/getBookById/:id").get(getBookById);                           
router.route("/updateBookById/:id").patch(jwtVerification,updateBookById);                           



export default router;
