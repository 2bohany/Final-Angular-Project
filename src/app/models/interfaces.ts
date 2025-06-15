export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  bio?: string; // Optional bio field
  profileImage?: string; // Optional profile image URL
  backgroundImage?: string; // Optional background image URL
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProfileUpdateResponse {
  user: User;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  subject: string;
  questions: Question[];
  teacherId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  question: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  options: string[];
  correctAnswer: string | number;
  points: number;
}

export interface ExamResult {
  id: string;
  examId: Exam;
  studentId: User;
  answers: {
    questionId: string;
    answer: any;
  }[];
  score: number;
  totalPoints: number;
  completedAt: Date;
}

export interface DashboardStats {
  totalExams: number;
  passedExams: number;
  failedExams: number;
  averageScore: number;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  email: string;
  examsTaken: {
    examId: string;
    examTitle: string;
    score: number;
    totalPoints: number;
    completedAt: Date;
    status: 'passed' | 'failed';
  }[];
  averageScore: number;
}

