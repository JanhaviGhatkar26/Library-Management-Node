import mongoose, { Schema, model } from "mongoose";
const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowecase: true,
      trim: true,
    },
    mobile_no: {
      type: Number,
      required: true,
    },
    studentClass: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      required: true,
    },
    division: {
      type: String,
      enum: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",],
      required: true,
      lowecase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    QR_code: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
      lowecase: true,
      trim: true,
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
