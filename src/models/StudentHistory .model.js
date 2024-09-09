import mongoose from 'mongoose';

const StudentHistorySchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  total_books_borrowed: {
    type: Number,
    default: 0
  },
  borrow_history: [
    {
      book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      borrowed_at: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

export const StudentHistory = mongoose.model('StudentHistory', StudentHistorySchema);


