const mongoose = require('mongoose');

const normalizeTeacherIdentityPart = (value) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const TeacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      trim: true,
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
    identityKey: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

TeacherSchema.pre('validate', function teacherIdentityPreValidate(next) {
  if (this.fullName && this.subjectName) {
    this.identityKey = [
      normalizeTeacherIdentityPart(this.fullName),
      normalizeTeacherIdentityPart(this.subjectName),
    ].join('::');
  }
  next();
});

TeacherSchema.index({ identityKey: 1 });

module.exports = mongoose.model('Teacher', TeacherSchema);
