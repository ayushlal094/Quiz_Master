// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const { registerTeacher, getTeacherDashboard, getAllTeachers } = require('../controllers/teacherController');

router.post('/register', registerTeacher);
router.get('/', getAllTeachers);
router.get('/:teacherId/dashboard', getTeacherDashboard);

module.exports = router;
