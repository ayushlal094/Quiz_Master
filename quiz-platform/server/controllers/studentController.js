const Student = require('../models/Student');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

// Register or login student by UID
const loginStudent = async (req, res) => {
  try {
    const { uid, name } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: 'UID is required' });

    const uidUpper = uid.trim().toUpperCase();
    let student = await Student.findOne({ uid: uidUpper });

    if (!student) {
      student = new Student({ uid: uidUpper, name: name || '' });
      await student.save();
    } else if (name && !student.name) {
      student.name = name;
      await student.save();
    }

    res.json({ success: true, data: student, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz answers and auto-evaluate
const submitQuiz = async (req, res) => {
  try {
    const { studentUid, studentName, quizId, answers, timeTakenSeconds } = req.body;

    if (!studentUid || !quizId || !answers) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const uidUpper = studentUid.toUpperCase();

    // Check for duplicate attempt
    const existing = await Result.findOne({ studentUid: uidUpper, quizId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already attempted this quiz', data: existing });
    }

    // Fetch quiz WITH correct answers
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Auto-evaluate
    let correct = 0;
    const evaluatedAnswers = quiz.questions.map((q, idx) => {
      const selectedOption = answers[idx] !== undefined ? answers[idx] : -1;
      const isCorrect = selectedOption === q.correctOption;
      if (isCorrect) correct++;
      return { questionIndex: idx, selectedOption, isCorrect };
    });

    const scorePercent = parseFloat(((correct / quiz.questions.length) * 100).toFixed(1));

    const result = new Result({
      studentUid: uidUpper,
      studentName: studentName || '',
      quizId,
      quizTitle: quiz.title,
      teacherName: quiz.teacherName,
      subject: quiz.subject,
      totalQuestions: quiz.questions.length,
      correctAnswers: correct,
      score: scorePercent,
      answers: evaluatedAnswers,
      timeTakenSeconds: timeTakenSeconds || 0,
    });

    await result.save();

    // Return result WITH question details for review
    const detailedAnswers = quiz.questions.map((q, idx) => ({
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctOption,
      selectedOption: evaluatedAnswers[idx].selectedOption,
      isCorrect: evaluatedAnswers[idx].isCorrect,
    }));

    res.status(201).json({
      success: true,
      data: { ...result.toObject(), detailedAnswers },
      message: 'Quiz submitted and evaluated!',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already attempted this quiz' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's results
const getStudentResults = async (req, res) => {
  try {
    const { uid } = req.params;
    const results = await Result.find({ studentUid: uid.toUpperCase() }).sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rankings for a specific quiz
const getQuizRankings = async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await Result.find({ quizId }).sort({ score: -1, timeTakenSeconds: 1 });

    const rankings = results.map((r, idx) => ({
      rank: idx + 1,
      studentUid: r.studentUid,
      studentName: r.studentName,
      score: r.score,
      correctAnswers: r.correctAnswers,
      totalQuestions: r.totalQuestions,
      timeTakenSeconds: r.timeTakenSeconds,
    }));

    const avgScore =
      results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
        : null;

    res.json({ success: true, data: { rankings, avgScore, totalAttempts: results.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { loginStudent, submitQuiz, getStudentResults, getQuizRankings };
