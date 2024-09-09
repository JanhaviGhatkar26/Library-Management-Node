import { Librarian } from "../models/librarian.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { validationResult } from "express-validator";

const generateAccess_RefreshToken = async (librarianId) => {
  try {
    const librarian = await Librarian.findById(librarianId);
    const accessToken = await librarian.generateAccessToken();
    const refreshToken = await librarian.generateRefreshToken();
    librarian.refreshToken = refreshToken;
    await librarian.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new apiError(500, "Something went wrong while generating token");
  }
};

const registerLibrarian = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, mobile_no, address, password, status, userName } = req.body;
    console.log("req.body :", req.body);

    if (
      [name, mobile_no, address, password, status].some((field) => {
        console.log("field", field);
        return typeof field === "string" && field.trim() === "";
      })
    ) {
      return res.status(400).json({ Status: "All fields are compulsory" });
    }

    const existedAdmin = await Librarian.findOne({
      $or: [{ name }, { mobile_no }],
    });
    if (existedAdmin) {
      return res.status(409).json({
        Status: `Admin with email or phone is already exist`,
        existedAdmin,
      });
    }

    const insertData = {
      name: name.trim().toLowerCase(),
      mobile_no: mobile_no,
      address: address,
      password: password,
      status: status,
    };
    const newLibrarian = await Librarian.create(insertData);
    if (!newLibrarian) {
      return res
        .status(500)
        .json({ Status: `Something went wrong while registering librarian` });
    }
    const librarian = await Librarian.findById(newLibrarian._id).select(
      "-password"
    );
    return res
      .status(201)
      .json({ Status: "Admin registerd successfully..!!", librarian });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const loginLibrarian = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body) {
      return res.status(400).json({ Status: "Request body is missing" });
    }
    const { userName, password } = req.body;

    if (
      [userName, password].some((field) => {
        field?.trim() === "";
      })
    ) {
      return res.status(400).json({ Status: "All fields are compulsory" });
    }
    const existingAccessToken = req.cookies.accessToken;
    if (existingAccessToken) {
      return res.status(400).json({ status: "Librarian is already logged in" });
    }
    const librarian = await Librarian.findOne({ userName: userName });
    if (!librarian) {
      return res.status(400).json({ Status: "Librarian does not exist" });
    }

    const isPasswordValid = await librarian.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(400).json({ Status: "Invalid login credentials" });
    }
    if (!librarian.status) {
      return res.status(400).json({
        Status: "Libranian is not active",
      });
    }
    const { accessToken, refreshToken } = await generateAccess_RefreshToken(
      librarian._id
    );
    const logedLibrarian = await Librarian.findById(librarian._id).select(
      "userName name mobile_no"
    );
    console.log(logedLibrarian);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Librarian logged In Successfully", {
          Librarian: logedLibrarian,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const logoutlibrarian = asyncHandler(async (req, res) => {
  try {
    await Librarian.findByIdAndUpdate(
      req.person._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ Status: "Admin logged out successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});
export { registerLibrarian, loginLibrarian, logoutlibrarian };
