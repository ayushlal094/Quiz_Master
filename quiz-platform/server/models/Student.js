const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'Student UID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
