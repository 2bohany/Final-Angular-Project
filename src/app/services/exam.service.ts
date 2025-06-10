import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Exam, ExamResult, DashboardStats } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  
  // Mock exams data
  private mockExams: Exam[] = [
    {
      id: '1',
      title: 'امتحان الرياضيات - الوحدة الأولى',
      description: 'امتحان شامل يغطي الجبر والهندسة',
      duration: 60,
      questions: [
        {
          id: '1',
          text: 'ما هو ناتج 2 + 2؟',
          type: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          points: 5
        },
        {
          id: '2',
          text: 'الجذر التربيعي لـ 16 هو 4',
          type: 'true-false',
          correctAnswer: 0,
          points: 5
        }
      ],
      teacherId: '2',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'امتحان العلوم - الفيزياء',
      description: 'امتحان في أساسيات الفيزياء والحركة',
      duration: 45,
      questions: [
        {
          id: '3',
          text: 'ما هي وحدة قياس السرعة؟',
          type: 'multiple-choice',
          options: ['متر', 'ثانية', 'متر/ثانية', 'كيلوجرام'],
          correctAnswer: 2,
          points: 10
        }
      ],
      teacherId: '2',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      title: 'امتحان اللغة الإنجليزية',
      description: 'امتحان في القواعد والمفردات',
      duration: 90,
      questions: [
        {
          id: '4',
          text: 'Choose the correct form: "I ___ to school yesterday"',
          type: 'multiple-choice',
          options: ['go', 'went', 'going', 'goes'],
          correctAnswer: 1,
          points: 5
        }
      ],
      teacherId: '2',
      isActive: true,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    }
  ];

  // Mock exam results
  private mockResults: ExamResult[] = [
    {
      id: '1',
      examId: '1',
      studentId: '1',
      answers: [
        { questionId: '1', answer: 1 },
        { questionId: '2', answer: 0 }
      ],
      score: 10,
      totalPoints: 10,
      completedAt: new Date('2024-01-16')
    },
    {
      id: '2',
      examId: '2',
      studentId: '1',
      answers: [
        { questionId: '3', answer: 2 }
      ],
      score: 10,
      totalPoints: 10,
      completedAt: new Date('2024-01-21')
    },
    {
      id: '3',
      examId: '3',
      studentId: '1',
      answers: [
        { questionId: '4', answer: 0 }
      ],
      score: 0,
      totalPoints: 5,
      completedAt: new Date('2024-01-26')
    }
  ];

  constructor() { }

  getAvailableExams(): Observable<Exam[]> {
    return of(this.mockExams.filter(exam => exam.isActive)).pipe(delay(500));
  }

  getExamById(id: string): Observable<Exam | undefined> {
    const exam = this.mockExams.find(e => e.id === id);
    return of(exam).pipe(delay(300));
  }

  getStudentResults(studentId: string): Observable<ExamResult[]> {
    const results = this.mockResults.filter(r => r.studentId === studentId);
    return of(results).pipe(delay(400));
  }

  getStudentDashboardStats(studentId: string): Observable<DashboardStats> {
    const results = this.mockResults.filter(r => r.studentId === studentId);
    const totalExams = results.length;
    const passedExams = results.filter(r => (r.score / r.totalPoints) >= 0.6).length;
    const failedExams = totalExams - passedExams;
    const averageScore = totalExams > 0 
      ? Math.round((results.reduce((sum, r) => sum + (r.score / r.totalPoints), 0) / totalExams) * 100)
      : 0;

    const stats: DashboardStats = {
      totalExams,
      passedExams,
      failedExams,
      averageScore
    };

    return of(stats).pipe(delay(600));
  }

  submitExamAnswers(examId: string, studentId: string, answers: any[]): Observable<ExamResult> {
    const exam = this.mockExams.find(e => e.id === examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    let score = 0;
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

    answers.forEach(answer => {
      const question = exam.questions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        score += question.points;
      }
    });

    const result: ExamResult = {
      id: (this.mockResults.length + 1).toString(),
      examId,
      studentId,
      answers,
      score,
      totalPoints,
      completedAt: new Date()
    };

    this.mockResults.push(result);
    return of(result).pipe(delay(800));
  }

  getSubjectScores(studentId: string): Observable<any[]> {
    const subjectData = [
      { subject: 'الرياضيات', score: 85, color: '#3B82F6' },
      { subject: 'العلوم', score: 92, color: '#10B981' },
      { subject: 'اللغة الإنجليزية', score: 78, color: '#F59E0B' },
      { subject: 'التاريخ', score: 88, color: '#8B5CF6' },
      { subject: 'الجغرافيا', score: 82, color: '#EF4444' }
    ];

    return of(subjectData).pipe(delay(400));
  }
}

