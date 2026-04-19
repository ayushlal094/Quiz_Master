const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getStudentResults } = require('../controllers/studentController');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/:uid/results', getStudentResults);

module.exports = router;
