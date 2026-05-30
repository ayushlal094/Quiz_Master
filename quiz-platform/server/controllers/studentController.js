const Student = require('../models/Student');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

const normalizeUid = (uid) => uid.trim().toUpperCase();

const isValidUid = (uid) => /^[A-Z0-9_-]{3,40}$/.test(uid);

const getFriendlyErrorMessage = (error) => {
  if (/ETIMEDOUT|ENOTFOUND|ECONNREFUSED|MongoServerSelectionError/i.test(error.message)) {
    return 'Database connection timed out. Please retry after the database is reachable.';
  }
  return error.message;
};

const registerStudent = async (req, res) => {
  try {
    const rawUid = req.body.uid || '';
    const rawName = req.body.name || '';

    const uid = normalizeUid(rawUid);
    const name = rawName.trim();

    if (!uid || !name) {
      return res.status(400).json({
        success: false,
        message: 'Student UID and name are required.',
      });
    }

    if (!isValidUid(uid)) {
      return res.status(400).json({
        success: false,
        message: 'Student UID must be 3-40 chars and can use A-Z, 0-9, underscore, hyphen.',
      });
    }

    const existing = await Student.findOne({ uid });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Student UID already exists. Please sign in as existing student.',
      });
    }

    const student = new Student({ uid, name });
    await student.save();

    return res.status(201).json({
      success: true,
      data: student.toObject(),
      message: 'Student account created successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Student UID already exists. Please sign in as existing student.',
      });
    }
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

// Existing student login by UID only
const loginStudent = async (req, res) => {
  try {
    const rawUid = req.body.uid || '';
    const uid = normalizeUid(rawUid);

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'Student UID is required for existing login.',
      });
    }

    const student = await Student.findOne({ uid }).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student UID not found. If you are new, create account first.',
      });
    }

    return res.json({ success: true, data: student, message: 'Login successful' });
  } catch (error) {
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
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

    return res.status(201).json({
      success: true,
      data: { ...result.toObject(), detailedAnswers },
      message: 'Quiz submitted and evaluated!',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already attempted this quiz' });
    }
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

// Get student's results
const getStudentResults = async (req, res) => {
  try {
    const { uid } = req.params;
    const results = await Result.find({ studentUid: uid.toUpperCase() }).sort({ createdAt: -1 });
    return res.json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
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

    return res.json({ success: true, data: { rankings, avgScore, totalAttempts: results.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

module.exports = { registerStudent, loginStudent, submitQuiz, getStudentResults, getQuizRankings };
