const express = require('express');
const router = express.Router();
const { submitQuiz, getQuizRankings } = require('../controllers/studentController');

router.post('/submit', submitQuiz);
router.get('/quiz/:quizId/rankings', getQuizRankings);

module.exports = router;
