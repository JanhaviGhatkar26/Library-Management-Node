import multer from "multer";

// export default multer({
// storage:multer.diskStorage({
//     destination:function(req,files,cb){
//         cb(null,"Students");
//     },
//     filename:function(req,file,cb){
//         cb(null,file.fieldname+"_"+".jpg");
//     }
// })
// }).fields([
//     {name: "photo", maxCount:1},
// ]);



export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname,'/public/students'));
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "_" + ".jpg");
    }
  });
  
  // const upload = multer({ storage }).fields([
  //   { name: "photo", maxCount: 1 },
  // ]);
  



// const upd = multer({ storage: storage }).single("profile");
// router.post("/data", (req, res) => {
// upd(req, res, function (err) {
// if (err instanceof multer.MulterError) {
// console.log("A Multer error occurred when uploading");
// } else if (err) {
// console.log("An unknown error occurred when uploading", err);
// }
// });
// });

// upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       // A Multer error occurred when uploading.
//       return res.status(500).json({ error: err.message });
//     } else if (err) {
//       // An unknown error occurred.
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     // Everything went fine. Process the uploaded files as needed.
//     const photoFiles = req.files['photo'];