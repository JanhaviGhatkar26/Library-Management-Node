import { Book } from "../models/book.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { ObjectId } from "mongodb";

const addNewBook = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      author,
      publishDate,
      shelfNo,
      quantity,
      status,
    } = req.body;
    if (
      [title, description, author, publishDate, shelfNo, quantity, status].some(
        (fields) => {
          fields.trim() === "";
        }
      )
    ) {
      return res.status(400).json({ Status: "All Fields are compulsory..." });
    }
    const founded_data = await Book.find({ title: title.toLowerCase() });
    console.log(founded_data);
    if (founded_data.length > 0) {
      return res.status(409).json({
        status: `book is already exist with name ${title}`,
        founded_data,
      });
    }
    const bookData = {
      title: title.toLowerCase(),
      description: description.toLowerCase(),
      author: author.toLowerCase(),
      publishDate: publishDate,
      shelfNo: shelfNo,
      quantity: quantity,
      status: status,
      librarianID: req.person._id,
      created_by: req.person.name,
      updated_by: req.person.name,
    };
    const book = await Book.create(bookData);
    const newBook = await Book.findById(book._id);
    if (!newBook) {
      return res
        .status(400)
        .json({ Status: `Something went wrong while adding book` });
    }
    return res.status(201).json({ message: "Book added successfuly", newBook });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const deleteBookById = asyncHandler(async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!bookId) {
      return res
        .status(400)
        .json({ Status: "Id is required to delete the book" });
    }
    const founded_data = await Book.findById(bookId);
    if (!founded_data) {
      return res
        .status(400)
        .json({ Status: `No book found with id : ${bookId}` });
    }
    const deleted_book = await Book.findByIdAndDelete(founded_data._id);
    if (!deleted_book) {
      return res
        .status(400)
        .json({ Status: `Book deleteing operation is failed.!` });
    }
    return res.status(200).json({ Status: "Book deleted..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const getAllBooks = asyncHandler(async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "librarians",
          localField: "librarianID",
          foreignField: "_id",
          as: "LibrarianDetails",
        },
      },
      {
        $unwind: {
          path: "$LibrarianDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          publishDate: 1,
          shelfNo: 1,
          quantity: 1,
          status: 1,
          created_by: 1,
          updated_by: 1,
          "LibrarianDetails.name": 1,
          "LibrarianDetails.userName": 1,
          "LibrarianDetails.status": 1,
        },
      },
    ];
    const books = await Book.aggregate(pipeline);
    if (!books || books.length === 0) {
      return res.status(400).json({
        Status: "No Books found in the database",
        Data: null,
      });
    }
    return res.status(200).json({
      Status: "Below books are found in database",
      Data: books,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const getBookById = asyncHandler(async (req, res) => {
  try {
    const bookID = req.params.id;
    if (!bookID) {
      return res
        .status(400)
        .json({ Status: `Id is required to fetch the book` });
    }
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(bookID),
        },
      },
      {
        $lookup: {
          from: "librarians",
          localField: "librarianID",
          foreignField: "_id",
          as: "LibrarianDetails",
        },
      },
      {
        $unwind: {
          path: "$LibrarianDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          publishDate: 1,
          shelfNo: 1,
          quantity: 1,
          status: 1,
          created_by: 1,
          updated_by: 1,
          "LibrarianDetails.name": 1,
          "LibrarianDetails.userName": 1,
          "LibrarianDetails.status": 1,
        },
      },
    ];
    const founded_data = await Book.aggregate(pipeline);
    console.log(founded_data);
    if (!founded_data || founded_data.length === 0) {
      return res
        .status(400)
        .json({ Status: `No book found with id ${bookID}` });
    }
    return res
      .status(200)
      .json({ Status: `Data foun with id  ${bookID}: `, Data: founded_data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});

const updateBookById = asyncHandler(async (req, res) => {
  try {
    const bookId = req.params.id;
    const { shelfNo, quantity, status } = req.body;
    if ([shelfNo, quantity, status].some((field) => field?.trim() === "")) {
      return res.status(400).json({
        Status:
          "At least one of shelfNo, quantity, or status is compulsory to update book details.",
      });
    }
    const founded_data = await Book.findById(bookId);
    if (!founded_data || founded_data.length === 0) {
      return res
        .status(400)
        .json({ Status: `Book not found for the given ID: ${bookId}` });
    }
    const updatedBook = await Book.findByIdAndUpdate(founded_data._id, {
      shelfNo: shelfNo,
      quantity: quantity,
      status: status.toLowerCase(),
      updated_by: req.person.name,
    });
    if (!updatedBook) {
      return res.status(400).json({ Status: "No book updated" });
    }
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(updatedBook._id),
        },
      },
      {
        $lookup: {
          from: "librarians",
          localField: "librarianID",
          foreignField: "_id",
          as: "LibrarianDetails",
        },
      },
      {
        $unwind: {
          path: "$LibrarianDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          publishDate: 1,
          shelfNo: 1,
          quantity: 1,
          status: 1,
          created_by: 1,
          updated_by: 1,
          "LibrarianDetails.name": 1,
          "LibrarianDetails.userName": 1,
          "LibrarianDetails.status": 1,
        },
      },
    ];
    const book = await Book.aggregate(pipeline);
    return res.status(200).json({ Status: "Updated book.", Data: book });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});
export { addNewBook, deleteBookById, getAllBooks, getBookById, updateBookById };
