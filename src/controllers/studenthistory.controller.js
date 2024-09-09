import {asyncHandler} from '../utils/asynchandler.util.js';
import {Student} from '../models/student.model.js';
import {IssueAndReturn} from '../models/issue&return.model.js';


const getStudentHistory = asyncHandler(async (req, res) => {
  try {
    const  student_id  = req.params.id;
    // Find the student
    const student = await Student.findById(student_id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const issuesAndReturns = await IssueAndReturn.find({ student_id });
    const borrowHistory = issuesAndReturns.map(issueReturn => {
      return {
        book_id: issueReturn.book_id,
        action: issueReturn.action,
        date: issueReturn.action === 'issue' ? issueReturn.issued_at : issueReturn.returned_at
      };
    });
    const totalBooksBorrowed = borrowHistory.filter(item => item.action === 'issue').length;
    return res.status(200).json({ 
      total_books_borrowed: totalBooksBorrowed,
      borrow_history: borrowHistory 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { getStudentHistory };
