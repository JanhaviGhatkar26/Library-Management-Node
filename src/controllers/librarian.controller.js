// import { redisInstance, RedisClient } from "../db/database.js";
import { Librarian } from "../models/librarian.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import { validationResult } from "express-validator";
import { setValue, getValue, deleteValue } from "../utils/redis.js";

// const redisClient = new RedisClient();
const vailidLibrarian = async (req, res) => {
  try {
    const id = req.params.id;
    const foundData = await Librarian.findById(id).select(
      "-password -refreshToken"
    );
    if (!foundData || foundData.length === 0) {
      return res
        .status(404)
        .json({ Status: `No Librarian found with id: ${id}`, Data: null });
    }
    return foundData;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
};

const getAllLibrarians = asyncHandler(async (req, res) => {
  try {
    let librarianData = await getValue("all-librarians");
    // librarianData = JSON.parse(librarianData); // Parse the JSON string
    if (librarianData) {
      return res.status(200).json({
        Status: "Data found from Redis",
        librarianData,
      });
    }
    let librarians = await Librarian.find({}).select("-password -refreshToken");
    if (!librarians || librarians.length === 0) {
      return res.status(400).json({ Status: `No admin found` });
    }
    await setValue("all-librarians", librarians);
    return res.status(200).json({ Status: "Data found", librarians });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const getLibrarianById = asyncHandler(async (req, res) => {
  try {
    const librarian = await vailidLibrarian(req, res);
    return res.status(200).json({ Status: "Data found", Data: librarian });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const deletedLibrarianById = asyncHandler(async (req, res) => {
  try {
    const librarian = await vailidLibrarian(req, res);
    await Librarian.findByIdAndDelete(librarian._id);
    await deleteValue("all-librarians");
    return res
      .status(200)
      .json({ Status: "Librarian deleted successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const updateLibrarianById = asyncHandler(async (req, res) => {
  try {
    const { status, mobile_no, address } = req.body;
    if (!mobile_no && !address && !status) {
      return res.status(400).json({
        Status:
          "At least one of mobile_no, address or status is required to update student details.",
      });
    }
    const librarian = await vailidLibrarian(req, res);
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
    const updatedLibrarian = await Librarian.findByIdAndUpdate(librarian._id, {
      $set: updatedFields,
      updated_by: req.person.name,
    });
    if (!updatedLibrarian) {
      return res.status(400).json({ Status: "No librarian updated" });
    }
    const data = await Librarian.findById(updatedLibrarian._id);
    await deleteValue("all-librarians");
    return res.status(200).json({ Status: "Updated librarian", data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

export {
  getAllLibrarians,
  deletedLibrarianById,
  getLibrarianById,
  updateLibrarianById,
};
