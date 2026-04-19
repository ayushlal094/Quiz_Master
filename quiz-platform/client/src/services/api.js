import axios from 'axios';

const API_TIMEOUT_MS = parseInt(process.env.REACT_APP_API_TIMEOUT_MS || '10000', 10);

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,
});

// Teacher APIs
export const registerTeacher = (data) => API.post('/teachers/register', data);
export const claimTeacherId = (data) => API.post('/teachers/claim-id', data);
export const loginTeacher = (data) => API.post('/teachers/login', data);
export const getAllTeachers = () => API.get('/teachers');
export const getTeacherDashboard = (teacherId) => API.get(`/teachers/${teacherId}/dashboard`);

// Quiz APIs
export const createQuiz = (data) => API.post('/quizzes', data);
export const getAllQuizzes = (search = '') => API.get(`/quizzes${search ? `?search=${search}` : ''}`);
export const getQuizForStudent = (quizId) => API.get(`/quizzes/${quizId}/student`);
export const getQuizForTeacher = (quizId) => API.get(`/quizzes/${quizId}/teacher`);
export const toggleQuizStatus = (quizId) => API.patch(`/quizzes/${quizId}/toggle`);

// Student APIs
export const registerStudent = (data) => API.post('/students/register', data);
export const loginStudent = (data) => API.post('/students/login', data);
export const getStudentResults = (uid) => API.get(`/students/${uid}/results`);

// Result APIs
export const submitQuiz = (data) => API.post('/results/submit', data);
export const getQuizRankings = (quizId) => API.get(`/results/quiz/${quizId}/rankings`);

export default API;
