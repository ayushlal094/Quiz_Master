const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedOption: Number, // -1 = unanswered
  isCorrect: Boolean,
});

const ResultSchema = new mongoose.Schema(
  {
    studentUid: {
      type: String,
      required: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    quizId: {
      type: String,
      required: true,
    },
    quizTitle: {
      type: String,
      required: true,
    },
    teacherName: {
      type: String,
    },
    subject: {
      type: String,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    score: {
      type: Number, // Percentage
      required: true,
    },
    answers: [AnswerSchema],
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attempts (one attempt per student per quiz)
ResultSchema.index({ studentUid: 1, quizId: 1 }, { unique: true });
ResultSchema.index({ quizId: 1, score: -1 });
ResultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Result', ResultSchema);
