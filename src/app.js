import express from "express";
import cookieParser from "cookie-parser";
import librarianRouter from "./routes/librarian.routes.js"
import bookRouter from "./routes/book.routes.js";
import studentRouter from "./routes/student.routes.js";
import issueOrReturnRouter from "./routes/issue&return.routes.js"
import studentHistoryRouter from "./routes/studentHistory.routes.js"
import multer from "multer";
import bodyParser from "body-parser";

const app = express();
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(bodyParser.json({
    type: ["application/x-www-form-urlencoded", "application/json"]
  }));
app.use(express.static("public"))
app.use(cookieParser())
const storage = multer.memoryStorage();
const upload = multer({ dest:'public/students'});
app.use(upload.any());


app.use("/api/v1/librarians",librarianRouter);
app.use("/api/v1/books",bookRouter);
app.use("/api/v1/students",studentRouter);
app.use("/api/v1/issueOrReturnBook",issueOrReturnRouter);
app.use("/api/v1/StudentHistory",studentHistoryRouter);

export{app};
