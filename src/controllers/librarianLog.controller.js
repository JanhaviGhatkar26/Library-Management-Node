import { Librarian } from "../models/librarian.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { validationResult } from "express-validator";
import { setValue, getValue, deleteValue } from "../utils/redis.js";
import { capitalizeWords, librarianScema } from "../validator/YupValidation.js";

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
    await librarianScema.validate(req.body, { abortEarly: false });
    const { name, mobile_no, address, password, status, userName, email } =
      req.body;
    const existedAdmin = await Librarian.findOne({
      $or: [{ name }, { mobile_no }, { userName }, { email }],
      status: "1",
      is_deleted: "0",
    }).select("userName name address");
    if (existedAdmin) {
      return res.status(409).json({
        Status: `Admin with email / phone / username is already exist`,
        existedAdmin,
      });
    }

    const insertData = {
      name: capitalizeWords(name.trim()),
      email: email,
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
      "name userName mobile_no email address"
    );
    await deleteValue("all-librarians");
    return res
      .status(201)
      .json({ Status: "Librarian registerd successfully..!!", librarian });
  } catch (err) {
    if (err.name === "ValidationError") {
      const formattedErrors = err.inner.map((currError) => currError.message);
      return res.status(400).json({ errors: formattedErrors });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

const loginLibrarian = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ Status: "Request body is missing" });
    }
    const { userName, password } = req.body;

    if (
      [userName, password].some((field) => {
        field?.trim() === "";
      })
    ) {
      return res.status(400).json({ Status: "Invalid credentials" });
    }
    if (req.cookies.accessToken) {
      return res.status(400).json({ status: "Librarian is already logged in" });
    }
    // const librarian = await Librarian.findOne({ userName: userName });
    const librarian = await Librarian.findOne({
      userName: userName,
      status: "1",
      is_deleted: "0",
    });

    if (!librarian) {
      return res.status(400).json({ Status: "Librarian does not exist" });
    }

    const isPasswordValid = await librarian.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(400).json({ Status: "Invalid login credentials" });
    }
    const { accessToken, refreshToken } = await generateAccess_RefreshToken(
      librarian._id
    );
    const logedLibrarian = await Librarian.findById(librarian._id).select(
      "userName name mobile_no"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    await setValue(`${userName}-loggedin`, {
      logedLibrarian,
      accessToken,
      refreshToken,
    });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Librarian logged In Successfully",
        Librarian: logedLibrarian,
        accessToken,
        refreshToken,
      });
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
