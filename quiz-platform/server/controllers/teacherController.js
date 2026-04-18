const Teacher = require('../models/Teacher');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const normalizeTeacherIdentityPart = (value) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const buildTeacherIdentityKey = (fullName, subjectName) =>
  [normalizeTeacherIdentityPart(fullName), normalizeTeacherIdentityPart(subjectName)].join('::');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getFriendlyErrorMessage = (error) => {
  if (/ETIMEDOUT|ENOTFOUND|ECONNREFUSED|MongoServerSelectionError/i.test(error.message)) {
    return 'Database connection timed out. Please retry after the database is reachable.';
  }
  return error.message;
};

const normalizeTeacherId = (teacherId) => teacherId.trim().toUpperCase();

const isValidTeacherId = (teacherId) => /^[A-Z0-9_-]{3,40}$/.test(teacherId);

const findTeacherByTeacherId = async (teacherId) =>
  Teacher.findOne({ teacherId: { $regex: `^${escapeRegex(teacherId)}$`, $options: 'i' } }).lean();

const getTeachersByIdentity = async (identityKey, fullName, subjectName) => {
  const teachersByIdentity = await Teacher.find({ identityKey }).sort({ createdAt: 1 }).lean();
  if (teachersByIdentity.length > 0) {
    return teachersByIdentity;
  }

  return Teacher.find({
    fullName: { $regex: `^${escapeRegex(fullName)}$`, $options: 'i' },
    subjectName: { $regex: `^${escapeRegex(subjectName)}$`, $options: 'i' },
  })
    .sort({ createdAt: 1 })
    .lean();
};

const setIdentityKeyOnTeachers = async (teachers, identityKey) => {
  const teacherIdsToUpdate = teachers
    .filter((teacher) => teacher.identityKey !== identityKey)
    .map((teacher) => teacher._id);

  if (teacherIdsToUpdate.length > 0) {
    await Teacher.updateMany({ _id: { $in: teacherIdsToUpdate } }, { $set: { identityKey } });
  }
};

const pickTeacherWithMostQuizzes = async (teachers) => {
  if (teachers.length <= 1) {
    return teachers[0] || null;
  }

  const teacherIds = teachers.map((teacher) => teacher.teacherId);
  const quizCounts = await Quiz.aggregate([
    { $match: { teacherId: { $in: teacherIds } } },
    { $group: { _id: '$teacherId', count: { $sum: 1 } } },
  ]);

  const quizCountMap = new Map(quizCounts.map((entry) => [entry._id, entry.count]));
  return [...teachers].sort((a, b) => {
    const quizDiff = (quizCountMap.get(b.teacherId) || 0) - (quizCountMap.get(a.teacherId) || 0);
    if (quizDiff !== 0) return quizDiff;
    return new Date(a.createdAt) - new Date(b.createdAt);
  })[0];
};

const getTeacherGroupFromSeed = async (teacher) => {
  const identityKey = teacher.identityKey || buildTeacherIdentityKey(teacher.fullName, teacher.subjectName);
  const matchingTeachers = await getTeachersByIdentity(identityKey, teacher.fullName, teacher.subjectName);
  const teachers = matchingTeachers.length > 0 ? matchingTeachers : [teacher];
  await setIdentityKeyOnTeachers(teachers, identityKey);
  return { identityKey, teachers };
};

const registerTeacher = async (req, res) => {
  try {
    const rawTeacherId = req.body.teacherId || '';
    const rawFullName = req.body.fullName || '';
    const rawSubjectName = req.body.subjectName || '';

    const teacherId = normalizeTeacherId(rawTeacherId);
    const fullName = rawFullName.trim();
    const subjectName = rawSubjectName.trim();

    if (!teacherId || !fullName || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, full name, and subject name are required.',
      });
    }

    if (!isValidTeacherId(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID must be 3-40 chars and can use A-Z, 0-9, underscore, hyphen.',
      });
    }

    const existingByTeacherId = await findTeacherByTeacherId(teacherId);
    if (existingByTeacherId) {
      return res.status(409).json({
        success: false,
        message: 'Teacher ID already exists. Use a different ID or sign in as existing teacher.',
      });
    }

    const identityKey = buildTeacherIdentityKey(fullName, subjectName);
    const existingByIdentity = await getTeachersByIdentity(identityKey, fullName, subjectName);
    if (existingByIdentity.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Account already exists for this name/subject. Use "Set Teacher ID" first. Current ID: ${existingByIdentity[0].teacherId}`,
      });
    }

    const teacher = new Teacher({
      teacherId,
      fullName,
      subjectName,
      identityKey,
    });
    await teacher.save();

    return res.status(201).json({
      success: true,
      data: teacher.toObject(),
      message: 'Teacher account created successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Teacher ID already exists. Use a different ID or sign in as existing teacher.',
      });
    }
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

const claimTeacherId = async (req, res) => {
  try {
    const rawTeacherId = req.body.teacherId || '';
    const rawFullName = req.body.fullName || '';
    const rawSubjectName = req.body.subjectName || '';

    const teacherId = normalizeTeacherId(rawTeacherId);
    const fullName = rawFullName.trim();
    const subjectName = rawSubjectName.trim();

    if (!teacherId || !fullName || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, full name, and subject name are required.',
      });
    }

    if (!isValidTeacherId(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID must be 3-40 chars and can use A-Z, 0-9, underscore, hyphen.',
      });
    }

    const existingByTeacherId = await findTeacherByTeacherId(teacherId);
    if (existingByTeacherId) {
      return res.status(409).json({
        success: false,
        message: 'Teacher ID already exists. Please choose another one.',
      });
    }

    const identityKey = buildTeacherIdentityKey(fullName, subjectName);
    const matchingTeachers = await getTeachersByIdentity(identityKey, fullName, subjectName);
    if (matchingTeachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No existing account found with this full name and subject.',
      });
    }

    await setIdentityKeyOnTeachers(matchingTeachers, identityKey);
    const targetTeacher = (await pickTeacherWithMostQuizzes(matchingTeachers)) || matchingTeachers[0];
    const teacherIdsInGroup = matchingTeachers.map((teacher) => teacher.teacherId);

    await Teacher.updateOne(
      { _id: targetTeacher._id },
      {
        $set: {
          teacherId,
          fullName,
          subjectName,
          identityKey,
        },
      }
    );

    const otherTeacherIds = matchingTeachers
      .filter((teacher) => String(teacher._id) !== String(targetTeacher._id))
      .map((teacher) => teacher._id);
    if (otherTeacherIds.length > 0) {
      await Teacher.updateMany(
        { _id: { $in: otherTeacherIds } },
        { $set: { fullName, subjectName, identityKey } }
      );
    }

    // Move all quizzes of duplicate/old IDs to the claimed teacher ID.
    await Quiz.updateMany(
      { teacherId: { $in: teacherIdsInGroup } },
      { $set: { teacherId, teacherName: fullName, subject: subjectName } }
    );

    const updatedTeacher = await Teacher.findById(targetTeacher._id).lean();
    return res.json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher ID set successfully. Use this ID to sign in next time.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Teacher ID already exists. Please choose another one.',
      });
    }
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const teacherId = normalizeTeacherId(req.body.teacherId || '');
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required for existing login.',
      });
    }

    const teacherById = await findTeacherByTeacherId(teacherId);
    if (!teacherById) {
      return res.status(404).json({
        success: false,
        message: 'Teacher ID not found. If this is your old account, use "Set Teacher ID" first.',
      });
    }

    return res.json({
      success: true,
      data: teacherById,
      message: 'Teacher login successful',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    const routeTeacherId = normalizeTeacherId(req.params.teacherId || '');
    const teacher = await findTeacherByTeacherId(routeTeacherId);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const { teachers } = await getTeacherGroupFromSeed(teacher);
    const teacherIds = teachers.map((item) => item.teacherId);

    const quizzes = await Quiz.find({ teacherId: { $in: teacherIds } }).sort({ createdAt: -1 }).lean();
    const quizIds = quizzes.map((q) => q.quizId);
    const results = await Result.find({ quizId: { $in: quizIds } }).sort({ score: -1 }).lean();

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

    return res.json({
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
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

module.exports = {
  registerTeacher,
  claimTeacherId,
  loginTeacher,
  getTeacherDashboard,
  getAllTeachers,
};
