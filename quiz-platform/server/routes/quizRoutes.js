const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getQuizForStudent,
  getQuizWithAnswers,
  toggleQuizStatus,
} = require('../controllers/quizController');

router.post('/', createQuiz);
router.get('/', getAllQuizzes);
router.get('/:quizId/student', getQuizForStudent);
router.get('/:quizId/teacher', getQuizWithAnswers);
router.patch('/:quizId/toggle', toggleQuizStatus);

module.exports = router;
