<<<<<<< HEAD
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
=======
# 🎯 QuizMaster — Online Quiz Platform

A full-stack, production-grade Online Quiz Platform with automated evaluation, analytics, and rankings. Built with **React.js**, **Node.js + Express**, and **MongoDB**.
>>>>>>> ab3ffc74551e3eaa21cf4a504ed1adf9a3f040a5

---

## 📁 Project Structure

```
quiz-platform/
<<<<<<< HEAD
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
=======
├── client/                        # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Navbar.js      # Top navigation bar
│       │   │   └── UI.js          # Reusable: LoadingSpinner, Alert, EmptyState, StatCard
│       │   ├── teacher/           # (extendable teacher-specific components)
│       │   └── student/           # (extendable student-specific components)
│       ├── context/
│       │   └── AppContext.js      # Global state (current user, auth)
│       ├── pages/
│       │   ├── HomePage.js        # Role selection + login
│       │   ├── TeacherDashboard.js # Full teacher dashboard with analytics
│       │   ├── CreateQuizPage.js  # 2-step quiz creation wizard
│       │   ├── StudentDashboard.js # Quiz browser + results history
│       │   └── QuizAttemptPage.js # Quiz attempt + timer + result review
│       ├── services/
│       │   └── api.js             # Axios API service layer
│       ├── styles/
│       │   └── global.css         # Complete design system
│       ├── App.js                 # Root app + client-side routing
│       └── index.js               # React entry point
│
└── server/                        # Node.js + Express Backend
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── models/
    │   ├── Teacher.js             # Teacher schema
    │   ├── Quiz.js                # Quiz + Question schemas
    │   ├── Student.js             # Student schema
    │   └── Result.js              # Result + Answer schemas
    ├── controllers/
    │   ├── teacherController.js   # Teacher logic + dashboard analytics
    │   ├── quizController.js      # Quiz CRUD logic
    │   └── studentController.js   # Student login + quiz submit + evaluation
>>>>>>> ab3ffc74551e3eaa21cf4a504ed1adf9a3f040a5
    ├── routes/
    │   ├── teacherRoutes.js
    │   ├── quizRoutes.js
    │   ├── studentRoutes.js
    │   └── resultRoutes.js
<<<<<<< HEAD
    └── index.js                     # Express entry point
=======
    ├── .env.example
    ├── index.js                   # Express server entry point
    └── package.json
>>>>>>> ab3ffc74551e3eaa21cf4a504ed1adf9a3f040a5
```

---

## 🗄️ Database Schema

<<<<<<< HEAD
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
=======
### Teacher
| Field       | Type   | Description                  |
|-------------|--------|------------------------------|
| teacherId   | String | UUID (auto-generated, unique) |
| fullName    | String | Teacher's full name          |
| subjectName | String | Subject taught               |
| createdAt   | Date   | Auto timestamp               |

### Quiz
| Field             | Type     | Description                        |
|-------------------|----------|------------------------------------|
| quizId            | String   | UUID (auto-generated, unique)       |
| title             | String   | Quiz title                         |
| teacherId         | String   | Ref to Teacher                     |
| teacherName       | String   | Denormalized for fast reads        |
| subject           | String   | Denormalized subject name          |
| questions         | Array    | Array of Question sub-documents    |
| timeLimitMinutes  | Number   | 0 = no limit                       |
| isActive          | Boolean  | Whether quiz is visible to students|

### Question (embedded in Quiz)
| Field         | Type   | Description                  |
|---------------|--------|------------------------------|
| questionText  | String | The question                 |
| options       | Array  | Exactly 4 strings            |
| correctOption | Number | Index 0–3 of correct option  |

### Student
| Field     | Type   | Description                   |
|-----------|--------|-------------------------------|
| uid       | String | Unique student ID (uppercase) |
| name      | String | Optional display name         |
| createdAt | Date   | Auto timestamp                |

### Result
| Field            | Type   | Description                          |
|------------------|--------|--------------------------------------|
| studentUid       | String | Ref to Student                       |
| studentName      | String | Denormalized                         |
| quizId           | String | Ref to Quiz                          |
| quizTitle        | String | Denormalized                         |
| totalQuestions   | Number | Total count                          |
| correctAnswers   | Number | Auto-evaluated correct count         |
| score            | Number | Percentage (0–100)                   |
| answers          | Array  | Per-question: selected + isCorrect   |
| timeTakenSeconds | Number | Time taken for quiz                  |

---

## 🔌 API Endpoints

### Teachers
| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| POST   | /api/teachers/register          | Register new teacher            |
| GET    | /api/teachers                   | Get all teachers                |
| GET    | /api/teachers/:teacherId/dashboard | Get dashboard analytics      |

### Quizzes
| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | /api/quizzes                      | Create quiz (teacher only)           |
| GET    | /api/quizzes?search=              | Get all active quizzes (for students)|
| GET    | /api/quizzes/:quizId/student      | Get quiz without correct answers     |
| GET    | /api/quizzes/:quizId/teacher      | Get quiz with answers                |
| PATCH  | /api/quizzes/:quizId/toggle       | Toggle quiz active/inactive          |

### Students
| Method | Endpoint                   | Description                       |
|--------|----------------------------|-----------------------------------|
| POST   | /api/students/login        | Student login/register by UID     |
| GET    | /api/students/:uid/results | Get student's result history      |

### Results
| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| POST   | /api/results/submit                   | Submit + auto-evaluate quiz    |
| GET    | /api/results/quiz/:quizId/rankings    | Get quiz rankings + avg score  |

---

## 🚀 Step-by-Step Setup Instructions

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community  
  OR **MongoDB Atlas** (cloud, free) → https://cloud.mongodb.com
- **npm** (comes with Node.js)

---

### Step 1 — Clone / Download the Project

```bash
# If using git:
git clone <your-repo-url>
cd quiz-platform

# Or extract the downloaded zip and open the folder
```

---

### Step 2 — Set Up the Backend (Server)

```bash
cd server
npm install
```

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizplatform
```

> If using MongoDB Atlas, replace MONGO_URI with your Atlas connection string:
> `MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/quizplatform`

Start the server:
```bash
# Development (auto-restart on changes):
npm run dev

# OR production:
npm start
```

✅ You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
```

---

### Step 3 — Set Up the Frontend (Client)

Open a **new terminal** tab/window:

```bash
cd client
npm install
npm start
```

✅ The React app will open at **http://localhost:3000**

---

### Step 4 — Using the Application

#### As a Teacher:
1. Click **"I'm a Teacher"** on the home page
2. Enter your **Full Name** and **Subject Name** → click **Enter Dashboard**
3. Click **"+ Create New Quiz"**
4. Fill in quiz title, set number of questions, optional time limit → **Continue to Questions**
5. Enter each question with 4 options and select the correct answer
6. Click **Publish Quiz** — your quiz is now live!
7. Return to Dashboard to see student attempts, scores, and rankings

#### As a Student:
1. Click **"I'm a Student"** on the home page
2. Enter your **UID** (e.g. `STU001`) and optional name → **Start Learning**
3. Browse available quizzes on your dashboard
4. Click **Start Quiz** on any quiz
5. Answer questions (navigate with Previous/Next or the numbered dots)
6. Submit — see your score, grade, and detailed answer review!

---

## ⚙️ Environment Variables

| Variable    | Default                                    | Description         |
|-------------|--------------------------------------------|---------------------|
| PORT        | 5000                                       | Server port         |
| MONGO_URI   | mongodb://localhost:27017/quizplatform     | MongoDB connection  |

For the client, create `client/.env`:
```env
REACT_APP_API_URL=https://quiz-master-1hzo.onrender.com/api
```
(Not required if using the default proxy setting in package.json)

---

## ✨ Features

### Teacher
- ✅ Register with name + subject
- ✅ 2-step quiz creation wizard with dynamic question fields
- ✅ Dashboard: stats, analytics, rankings
- ✅ Bar chart: average score per quiz (Recharts)
- ✅ Student ranking table (across all quizzes)
- ✅ Per-quiz result drilldown
- ✅ Toggle quiz active/inactive
- ✅ Participation bar chart

### Student
- ✅ Login with UID
- ✅ Browse/search available quizzes
- ✅ Quiz attempt with progress dots + progress bar
- ✅ Countdown timer (if set by teacher)
- ✅ Question-by-question navigation
- ✅ Auto-submit on timer expiry
- ✅ Instant score + grade after submission
- ✅ Detailed answer review with correct vs. incorrect
- ✅ Result history on dashboard
- ✅ Duplicate attempt prevention

### System
- ✅ Automatic server-side evaluation (never trusts client)
- ✅ Score as percentage
- ✅ Rankings sorted by score (then time taken)
- ✅ Average class score analytics
- ✅ Search/filter quizzes

---

## 🛠️ Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18, Recharts            |
| Styling    | Custom CSS design system      |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB, Mongoose             |
| HTTP       | Axios                         |
| IDs        | UUID v4                       |

---

## 📦 Adding New Features (Extension Guide)

- **Authentication**: Add JWT middleware in `/server/middleware/auth.js`
- **File upload (import questions)**: Add multer + xlsx parsing
- **Email notifications**: Integrate nodemailer in result submission
- **Export results**: Add CSV export endpoint in resultRoutes
- **Multiple quiz attempts**: Remove unique index in Result schema

---

*QuizMaster — Built for real classroom use.*
>>>>>>> ab3ffc74551e3eaa21cf4a504ed1adf9a3f040a5
