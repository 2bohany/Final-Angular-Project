# Exam System Backend

This is the backend server for the exam system application.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/exam-system
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Exams
- GET /api/exams/teacher - Get all exams (teacher)
- GET /api/exams/student - Get active exams (student)
- GET /api/exams/:id - Get exam by ID
- POST /api/exams - Create new exam (teacher)
- PUT /api/exams/:id - Update exam (teacher)
- DELETE /api/exams/:id - Delete exam (teacher)
- POST /api/exams/:id/submit - Submit exam (student)
- GET /api/exams/:id/results - Get exam results

### Users
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- GET /api/users/dashboard/stats - Get student dashboard stats
- GET /api/users/dashboard/teacher-stats - Get teacher dashboard stats 