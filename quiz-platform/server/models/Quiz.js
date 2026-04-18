const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (v) => v.length === 4,
      message: 'Each question must have exactly 4 options',
    },
    required: true,
  },
  correctOption: {
    type: Number, // Index: 0, 1, 2, or 3
    required: [true, 'Correct option index is required'],
    min: 0,
    max: 3,
  },
});

const QuizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    teacherId: {
      type: String,
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'Quiz must have at least 1 question',
      },
    },
    timeLimitMinutes: {
      type: Number,
      default: 0, // 0 = no limit
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
