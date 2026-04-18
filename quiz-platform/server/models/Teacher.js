const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TeacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', TeacherSchema);
