<div align="center">

# 🎯 QuizMaster

### A Full-Stack Online Quiz Platform for Real Classroom Use

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**QuizMaster** is a production-grade quiz platform where teachers create and manage quizzes, and students attempt them in real time — with automated evaluation, countdown timers, rankings, and analytics dashboards.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Screenshots](#-project-structure)

</div>

---

## ✨ Features

### 👨‍🏫 For Teachers
- Register with name and subject — no password needed
- **2-step quiz creation wizard** with dynamic question fields
- Set optional countdown timers per quiz
- Toggle quizzes **active / inactive** at any time
- **Analytics Dashboard** — average scores, participation charts (Recharts), student rankings
- Drill into per-quiz results with full student breakdowns

### 👨‍🎓 For Students
- Login with a simple **Student UID**
- Browse and search all active quizzes
- Attempt quizzes with:
  - Question-by-question navigation (numbered dots + prev/next)
  - Live countdown timer with **auto-submit on expiry**
  - Progress bar
- Instant score, grade, and **detailed answer review** after submission
- View full result history on the dashboard
- **Duplicate attempt prevention** — can't re-take the same quiz

### 🔒 System
- All evaluation happens **server-side** — correct answers are never sent to the client
- Scores stored as percentages with time-taken for fair ranking
- Rankings sorted by score, then by time taken

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router (client-side) |
| Charts     | Recharts                          |
| Styling    | Custom CSS Design System          |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| HTTP       | Axios                             |
| IDs        | UUID v4                           |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quiz-platform.git
cd quiz-platform
```

---

### 2. Set Up the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizplatform
```

> Using MongoDB Atlas? Replace `MONGODB_URI` with your Atlas connection string.

Start the server:

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
```

---

### 3. Set Up the Frontend

Open a **new terminal**:

```bash
cd client
npm install
npm start
```

The React app opens at **[http://localhost:3000](http://localhost:3000)**

---

### 4. Environment Variables

| Variable      | Default                                      | Description           |
|---------------|----------------------------------------------|-----------------------|
| `PORT`        | `5000`                                       | Express server port   |
| `MONGODB_URI` | `mongodb://localhost:27017/quizplatform`     | MongoDB connection    |

For the client, optionally create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### Teachers
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/teachers/register`              | Register a new teacher       |
| GET    | `/api/teachers`                       | Get all teachers             |
| GET    | `/api/teachers/:teacherId/dashboard`  | Get teacher analytics        |

### Quizzes
| Method | Endpoint                              | Description                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/api/quizzes`                        | Create a new quiz                    |
| GET    | `/api/quizzes?search=`                | Get all active quizzes (students)    |
| GET    | `/api/quizzes/:quizId/student`        | Get quiz **without** correct answers |
| GET    | `/api/quizzes/:quizId/teacher`        | Get quiz **with** correct answers    |
| PATCH  | `/api/quizzes/:quizId/toggle`         | Toggle quiz active/inactive          |

### Students
| Method | Endpoint                        | Description                   |
|--------|---------------------------------|-------------------------------|
| POST   | `/api/students/login`           | Login/register by UID         |
| GET    | `/api/students/:uid/results`    | Get student's result history  |

### Results
| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| POST   | `/api/results/submit`                     | Submit + auto-evaluate quiz    |
| GET    | `/api/results/quiz/:quizId/rankings`      | Get rankings + average score   |

---

## 📁 Project Structure

```
quiz-platform/
├── client/                          # React Frontend
│   └── src/
│       ├── components/
│       │   └── shared/
│       │       ├── Navbar.js        # Top navigation
│       │       └── UI.js            # Shared UI components
│       ├── context/
│       │   └── AppContext.js        # Global auth state
│       ├── pages/
│       │   ├── HomePage.js          # Role selection + login
│       │   ├── TeacherDashboard.js  # Analytics + quiz management
│       │   ├── CreateQuizPage.js    # 2-step quiz creation wizard
│       │   ├── StudentDashboard.js  # Quiz browser + result history
│       │   └── QuizAttemptPage.js   # Quiz attempt + timer + review
│       ├── services/
│       │   └── api.js               # Axios API service layer
│       └── styles/
│           └── global.css           # Full CSS design system
│
└── server/                          # Node.js + Express Backend
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── models/
    │   ├── Teacher.js
    │   ├── Quiz.js                  # Quiz + Question schemas
    │   ├── Student.js
    │   └── Result.js
    ├── controllers/
    │   ├── teacherController.js
    │   ├── quizController.js
    │   └── studentController.js
    ├── routes/
    │   ├── teacherRoutes.js
    │   ├── quizRoutes.js
    │   ├── studentRoutes.js
    │   └── resultRoutes.js
    └── index.js                     # Express entry point
```

---

## 🗄️ Database Schema

<details>
<summary><strong>Teacher</strong></summary>

| Field         | Type   | Description                   |
|---------------|--------|-------------------------------|
| `teacherId`   | String | UUID (auto-generated, unique) |
| `fullName`    | String | Teacher's full name           |
| `subjectName` | String | Subject taught                |
| `createdAt`   | Date   | Auto timestamp                |

</details>

<details>
<summary><strong>Quiz</strong></summary>

| Field              | Type    | Description                        |
|--------------------|---------|------------------------------------|
| `quizId`           | String  | UUID (auto-generated, unique)      |
| `title`            | String  | Quiz title                         |
| `teacherId`        | String  | Reference to Teacher               |
| `questions`        | Array   | Embedded Question sub-documents    |
| `timeLimitMinutes` | Number  | `0` = no limit                     |
| `isActive`         | Boolean | Visible to students if `true`      |

</details>

<details>
<summary><strong>Student</strong></summary>

| Field       | Type   | Description              |
|-------------|--------|--------------------------|
| `uid`       | String | Unique student ID        |
| `name`      | String | Optional display name    |
| `createdAt` | Date   | Auto timestamp           |

</details>

<details>
<summary><strong>Result</strong></summary>

| Field              | Type   | Description                        |
|--------------------|--------|------------------------------------|
| `studentUid`       | String | Reference to Student               |
| `quizId`           | String | Reference to Quiz                  |
| `totalQuestions`   | Number | Total question count               |
| `correctAnswers`   | Number | Auto-evaluated by server           |
| `score`            | Number | Percentage (0–100)                 |
| `timeTakenSeconds` | Number | For ranking tiebreakers            |
| `answers`          | Array  | Per-question: selected + isCorrect |

</details>

---

## 🔮 Possible Extensions

- **JWT Authentication** — add `server/middleware/auth.js` for secure sessions
- **Import Questions** — multer + xlsx parsing for bulk question upload
- **Email Notifications** — nodemailer on quiz submission
- **CSV Export** — export results per quiz or per student
- **Multiple Attempts** — remove unique index in the Result schema


---

<div align="center">

Built for real classroom use

</div>