export interface Question {
    id?: string;
    question: string;
    text?: string;  // For backward compatibility
    type?: string;  // For backward compatibility
    options: string[];
    correctAnswer: string;
    points?: number;  // For backward compatibility
}

export interface Exam {
    _id?: string;
    id?: string;  // For backward compatibility
    title: string;
    description: string;
    duration: number;
    questions: Question[];
    teacherId?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ExamResult {
    id?: string;
    examId: string;
    studentId: string;
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