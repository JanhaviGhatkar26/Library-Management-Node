import { Schema, model } from "mongoose";

const issueReturnSchema = new Schema(
  {
    book_id: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    action: {
      type: String,
      enum: ["issue", "return"],
      required: true,
    },
    issued_at: { 
      type: Date ,
      default: Date.now,
    },
    returned_at: {
      type :Date,
      default:null
    },
  },
  {
    timestamps: true,
  }
);

export const IssueAndReturn = model("IssueAndReturn", issueReturnSchema);
