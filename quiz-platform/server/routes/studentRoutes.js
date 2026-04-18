const express = require('express');
const router = express.Router();
const { loginStudent, getStudentResults } = require('../controllers/studentController');

router.post('/login', loginStudent);
router.get('/:uid/results', getStudentResults);

module.exports = router;
