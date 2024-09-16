import mongoose, { Schema, model } from "mongoose";
const studentSchema = new Schema(
  {
    name: {
      type: String,
    },
    mobile_no: {
      type: Number,
    },
    email: { type: String },
    address: {
      type: String,
    },
    studentClass: {
      type: Number,
      enum: Array.from({ length: 15 }, (_, i) => i + 1), // Generates [1, 2, ..., 15]
      required: true,
    },
    division: {
      type: String,
      enum: ["A", "B", "C", "D"],
    },
    photo: {
      type: String,
    },
    QR_code: {
      type: String,
    },
    status: {
      type: String,
      enum: ["1", "2"], // Restrict values to '1' active or '2' deactive
      default: "1", // Set the default value to '1'
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//store files in memory as buffers (instead of saving them to disk).
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

//post methods for save
//upload.single('photoFile') to handle a single file upload with the field name 'photoFile'.
// studentSchema.post("save",upload.single("photoFile"),async function (doc, next) {
//     try {
//       if (doc.isNew && doc.photoFile) {
//         //image save
//         const photoFolder = path.join( __dirname, `../public/student_photos/${doc._id}`);
//         if (!fs.existsSync(photoFolder)) {
//           fs.mkdirSync(photoFolder);
//         }
//         const photoPath = path.join(photoFolder, "photo.jpg");
//         fs.writeFileSync(photoPath, doc.photoFile.buffer);
//         doc.photo = photoPath;
//         //qrCode save
//         const qrCodeFolder = path.join(__dirname, `../public/student_qrCodes/${doc._id}`);
//         if(!fs.existsSync(qrCodeFolder)){
//             fs.mkdirSync(qrCodeFolder);
//         };

//         const qrCodePath = path.join(qrCodeFolder, 'qrcode.png');
//         const studentIdString = doc._id.toString();
//         await qrcode.toFile(qrCodePath,studentIdString);
//         doc.QR_code = qrCodePath;
//         await doc.save();
//       }
//       next();
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export const Student = model("Student", studentSchema);
