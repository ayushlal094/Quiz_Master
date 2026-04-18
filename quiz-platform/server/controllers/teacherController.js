const Teacher = require('../models/Teacher');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// Register or login teacher
const registerTeacher = async (req, res) => {
  try {
    const { fullName, subjectName } = req.body;
    if (!fullName || !subjectName) {
      return res.status(400).json({ success: false, message: 'Full name and subject are required' });
    }

    const teacher = new Teacher({ fullName: fullName.trim(), subjectName: subjectName.trim() });
    await teacher.save();

    res.status(201).json({ success: true, data: teacher, message: 'Teacher registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Teacher already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher dashboard data
const getTeacherDashboard = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get all quizzes by teacher
    const quizzes = await Quiz.find({ teacherId }).sort({ createdAt: -1 });

    // Get all quiz IDs
    const quizIds = quizzes.map((q) => q.quizId);

    // Get all results for those quizzes
    const results = await Result.find({ quizId: { $in: quizIds } }).sort({ score: -1 });

    // Per-quiz analytics
    const quizAnalytics = quizzes.map((quiz) => {
      const quizResults = results.filter((r) => r.quizId === quiz.quizId);
      const avgScore =
        quizResults.length > 0
          ? (quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length).toFixed(1)
          : null;

      return {
        quizId: quiz.quizId,
        title: quiz.title,
        subject: quiz.subject,
        totalQuestions: quiz.questions.length,
        totalAttempts: quizResults.length,
        averageScore: avgScore,
        createdAt: quiz.createdAt,
        isActive: quiz.isActive,
      };
    });

    // Rankings across all quizzes
    const rankingMap = {};
    results.forEach((r) => {
      if (!rankingMap[r.studentUid]) {
        rankingMap[r.studentUid] = {
          studentUid: r.studentUid,
          studentName: r.studentName,
          totalScore: 0,
          attempts: 0,
        };
      }
      rankingMap[r.studentUid].totalScore += r.score;
      rankingMap[r.studentUid].attempts += 1;
    });

    const rankings = Object.values(rankingMap)
      .map((s) => ({ ...s, avgScore: (s.totalScore / s.attempts).toFixed(1) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .map((s, idx) => ({ ...s, rank: idx + 1 }));

    const overallAvg =
      results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
        : null;

    res.json({
      success: true,
      data: {
        quizzes: quizAnalytics,
        results,
        rankings,
        overallAvg,
        totalQuizzes: quizzes.length,
        totalAttempts: results.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTeacher, getTeacherDashboard, getAllTeachers };
