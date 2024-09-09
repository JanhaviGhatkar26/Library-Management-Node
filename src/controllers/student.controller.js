import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import QRCode from "qrcode"
import fs from "fs";
import { validationResult } from "express-validator";

const div = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const valideStudent = async (req, res) => {
  try {
    const id = req.params.id;
    const foundData = await Student.findById(id);
    if (!foundData || foundData.length === 0) {
      return res
        .status(404)
        .json({ Status: `No Student found with id: ${id}`, Data: null });
    }
    return foundData;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
};

const getAllStudent = asyncHandler(async (req, res) => {
  try {
    const allStudent = await Student.find({});
    if (!allStudent || allStudent.length === 0) {
      return res.status(400).json({
        Status: "No students found in the database",
        Data: null,
      });
    }
    return res.status(200).json({
      Status: "Below students are found in database",
      Data: allStudent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const getStudentById = asyncHandler(async (req, res) => {
  try {
    const students = await valideStudent(req, res);
    return res.status(200).json({ status: "Data found", Data: students });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const DeleteStudentById = asyncHandler(async (req, res) => {
  try {
    const student = await valideStudent(req, res);
    const deletedUser = await Student.findByIdAndDelete(student._id);
    return res.status(200).json({ Status: "Student deleted successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const updateStudentById = asyncHandler(async (req, res) => {
  try {
    const { mobile_no, address, status, studentClass, division } = req.body;
    
    if (!mobile_no && !address && !status && !studentClass && !division) {
      return res.status(400).json({
        Status:
          "At least one of mobile_no, address, status, studentClass, or division is required to update student details.",
      });
    }
    const student = await valideStudent(req, res);
    const path = student.QR_code;
    const updatedFields = {};
    if (mobile_no) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      updatedFields.mobile_no = mobile_no;
    }
    if (address) {
      updatedFields.address = address;
    }
    if (status) {
      updatedFields.status = status.toLowerCase();
    }
    if (studentClass) {
      if (studentClass > 12 || studentClass < 0) {
        return res
          .status(400)
          .json({ Status: "Student must be between 1st to 12th standard" });
      }
      updatedFields.studentClass = studentClass;
    }
    if (division) {
      if (!div.includes(division)) {
        return res.status(400).json({ Status: "Division must be in A to Z" });
      }
      updatedFields.division = division;
    }
    const updatedStudent = await Student.findByIdAndUpdate(student._id, {
      $set: updatedFields,
      updated_by: req.person.name,
    });
    if (!updatedStudent) {
      return res.status(400).json({ Status: "No student updated" });
    }
    let qr = student.QR_code;
    qr = JSON.stringify(updatedStudent);
    const qrOptions = {
      errorCorrectionLevel: 'L',
      width: 377.95275591, 
      height: 377.95275591, 
      type: 'png' 
    };
  
    const filePath = path; 
    QRCode.toFile(filePath, qr, qrOptions, function (err) {
      if (err) return console.log("Error occurred:", err);
    });
    const studentDetails = await Student.findByIdAndUpdate(updatedStudent._id, {
      QR_code:filePath
    });
    const newAddedstudent = await Student.findById(studentDetails._id)
    const data = await Student.findById(updatedStudent._id);
    return res.status(200).json({ Status: "Updated student", Data: newAddedstudent });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const addNewStudent = asyncHandler(async (req, res) => {
  try {
    let imagePath = req.files[0].path;
    const extention = req.files[0].originalname.split(".")[1] || "jpg";
    imagePath = imagePath + "." + extention;

    let QRimagePath = req.files[0].path;
    const QRextention = req.files[0].originalname.split(".")[1] || "png";
    QRimagePath = QRimagePath + Math.random(Math.round()*10)+"." + QRextention;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, mobile_no, studentClass, division, address, status } =
      req.body;
    if (
      [name, mobile_no, studentClass, division, address, status].some(
        (field) => {
          field?.trim() === "";
        }
      )
    ) {
      return res.status(400).json({ Status: "All fields are compulsory." });
    }
    if (studentClass > 12 && studentClass < 0) {
      return res
        .status(400)
        .json({ Status: "Student must be between 1st to 12th standard" });
    }
    const uppercaseDivision = division.toUpperCase();
    if (!div.includes(uppercaseDivision)) {
      return res.status(400).json({ Status: "divison must be in A to Z" });
    }
    const student = await Student.findOne({ mobile_no: mobile_no });
    if (student) {
      return res
        .status(200)
        .json({
          Status: `Data found with mobile number: ${student.mobile_no}`,
          Data: student,
        });
    }
    const data = {
      name: name.toLowerCase(),
      mobile_no: mobile_no,
      studentClass: studentClass,
      division: division.toUpperCase(),
      address: address,
      status: status,
      created_by: req.person.name,
      updated_by: req.person.name,
    };

    const newStudent = await Student.create(data);
    if (!newStudent) {
      return res.status(400).json({
        Status: "Something went wrong while creating student",
        Data: null,
      });
    }
    let stringData = JSON.stringify(newStudent);
    const qrOptions = {
      errorCorrectionLevel: 'L',
      width: 377.95275591, 
      height: 377.95275591, 
      type: 'png' 
    };
  
    const filePath = QRimagePath; 
    QRCode.toFile(filePath, stringData, qrOptions, function (err) {
      if (err) return console.log("Error occurred:", err);
    });
    const studentDetails = await Student.findByIdAndUpdate(newStudent._id, {
      photo: imagePath,
      QR_code:filePath
    });
    const newAddedstudent = await Student.findById(studentDetails._id)
    return res.status(200).json({ Status: "Student created", data: newAddedstudent });
  } catch (error) {
    console.log(error);
  }
});

export {
  addNewStudent,
  getAllStudent,
  getStudentById,
  DeleteStudentById,
  updateStudentById,
};
