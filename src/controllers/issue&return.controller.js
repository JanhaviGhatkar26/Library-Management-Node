import { Book } from "../models/book.model.js";
import { Student } from "../models/student.model.js";
import { IssueAndReturn } from "../models/issue&return.model.js";
import { asyncHandler } from "../utils/asynchandler.util.js";
import { ObjectId } from "mongodb";

const issueReturnBook = asyncHandler(async (req, res) => {
  try {
    const { book_id, student_id, action } = req.body;
    switch (action) {
      case "issue":
        // Check if the student has already issued the specific book and not returned it
        const existingIssue = await IssueAndReturn.findOne({
          book_id,
          student_id,
          action: "issue",
          returned_at: null, // Book has not been returned
        });

        if (existingIssue) {
          return res.status(400).json({
            status:
              "Student has already issued this book and has not returned it",
          });
        }
        //update the book model
        const issueBook = await Book.findById(book_id);
        issueBook.quantity -= 1;
        await issueBook.save();
        
        const bookCount = await Student.findById(student_id);
        bookCount.totalBookBorrowed +=1;
        await bookCount.save();
        break;
      case "return":
        // Check if the student has issued the specific book and has not returned it
        const existingReturn = await IssueAndReturn.findOne({
          book_id,
          student_id,
          action: "return",
          returned_at: { $ne: null }, // Book has been returned
        });

        const issueOrNot = await IssueAndReturn.findOne({
          book_id,
          student_id,
          action: "issue",
        });
        if (!issueOrNot) {
          return res
            .status(400)
            .json({ status: "The student has not issued this book before" });
        }

        if (existingReturn) {
          return res
            .status(400)
            .json({ status: "Student has already returned this book" });
        }

        const returnBook = await Book.findById(book_id);
        returnBook.quantity += 1;
        if (!returnBook.status && returnBook.quantity > 0) {
          returnBook.status = true;
        }
        await returnBook.save();
        break;

      default:
        return res.status(400).json({ status: "Invalid action" });
    }

    async function getPreviousIssuedAtAndCreatedBy(book_id, student_id) {
      try {
        const previousIssueReturn = await IssueAndReturn.findOne({
          book_id: book_id,
          student_id: student_id,
          action: "issue",
        }).sort({ issued_at: -1 });

        if (previousIssueReturn) {
          return {
            issued_at: previousIssueReturn.issued_at,
          };
        } else {
          return {
            issued_at: null,

          };
        }
      } catch (error) {
        console.error(
          "Error fetching previous issued_at and created_by:",
          error
        );
        throw error;
      }
    }

    const previousIssueDetails = await getPreviousIssuedAtAndCreatedBy(book_id, student_id);
    const previousIssuedAt = previousIssueDetails ? previousIssueDetails.issued_at : null;

    // Create the issueReturn record
    const savedIssueReturn = await IssueAndReturn.create({
      book_id: book_id,
      student_id: student_id,
      action: action,
      issued_at: action === "issue" ? Date.now() : previousIssuedAt,
      returned_at: action === "return" ? Date.now() : null,
    });
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(savedIssueReturn._id),
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "BookDetails",
        },
      },
      {
        $unwind: {
          path: "$BookDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "StudentDetail",
        },
      },
      {
        $unwind: {
          path: "$StudentDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          student_id: 1,
          "StudentDetail.name": 1,
          "StudentDetail.mobile_no": 1,
          book_id: 1,
          "BookDetails.title": 1,
          "BookDetails.author": 1,
          action: 1,
        },
      },
    ];
    console.log(pipeline);
    const actiondetail = await IssueAndReturn.aggregate(pipeline);
    console.log(actiondetail);
    return res.status(200).json({
      status: "Book updated and IssueReturn record created successfully",
      data: { issueReturn: actiondetail },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

export { issueReturnBook };
