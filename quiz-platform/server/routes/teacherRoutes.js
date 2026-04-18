// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerTeacher,
  claimTeacherId,
  loginTeacher,
  getTeacherDashboard,
  getAllTeachers,
} = require('../controllers/teacherController');

router.post('/register', registerTeacher);
router.post('/claim-id', claimTeacherId);
router.post('/login', loginTeacher);
router.get('/', getAllTeachers);
router.get('/:teacherId/dashboard', getTeacherDashboard);

module.exports = router;
