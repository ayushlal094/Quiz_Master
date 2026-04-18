const Quiz = require('../models/Quiz');
const Teacher = require('../models/Teacher');

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { teacherId, title, questions, timeLimitMinutes } = req.body;

    if (!teacherId || !title || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Teacher ID, title, and questions are required' });
    }

    // Validate teacher exists
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.options || q.options.length !== 4 || q.correctOption === undefined) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is invalid. Each question needs text, 4 options, and a correct option.`,
        });
      }
    }

    const quiz = new Quiz({
      title: title.trim(),
      teacherId,
      teacherName: teacher.fullName,
      subject: teacher.subjectName,
      questions,
      timeLimitMinutes: timeLimitMinutes || 0,
    });

    await quiz.save();
    res.status(201).json({ success: true, data: quiz, message: 'Quiz created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active quizzes (for students)
const getAllQuizzes = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { teacherName: { $regex: search, $options: 'i' } },
      ];
    }

    const quizzes = await Quiz.find(filter, '-questions.correctOption').sort({ createdAt: -1 });

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single quiz for student (without correct answers)
const getQuizForStudent = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ quizId, isActive: true }, '-questions.correctOption');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz with answers (for teacher)
const getQuizWithAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle quiz active status
const toggleQuizStatus = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({ success: true, data: quiz, message: `Quiz ${quiz.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createQuiz, getAllQuizzes, getQuizForStudent, getQuizWithAnswers, toggleQuizStatus };
