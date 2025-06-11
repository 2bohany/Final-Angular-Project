import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Exam, ExamResult, DashboardStats } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:3000/api/exams';

  constructor(private http: HttpClient) { }

  // Get all exams
  getAllExams(): Observable<Exam[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teacher`).pipe(
      map(exams => exams.map(exam => ({
        ...exam,
        id: exam._id,
        isActive: true,
        teacherId: exam.teacherId || '1', // Default teacher ID if not provided
        updatedAt: exam.updatedAt || exam.createdAt,
        questions: exam.questions ? exam.questions.map((q: any) => ({ ...q, id: q._id })) : []
      })))
    );
  }

  // Get available exams (active exams)
  getAvailableExams(): Observable<Exam[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student`).pipe(
      map(exams => exams.map(exam => ({
        ...exam,
        id: exam._id,
        isActive: true,
        teacherId: exam.teacherId || '1',
        updatedAt: exam.updatedAt || exam.createdAt
      })))
    );
  }

  // Get exam by ID
  getExamById(id: string): Observable<Exam> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(exam => ({
        ...exam,
        id: exam._id,
        isActive: true,
        teacherId: exam.teacherId || '1',
        updatedAt: exam.updatedAt || exam.createdAt,
        questions: exam.questions ? exam.questions.map((q: any) => ({ ...q, id: q._id })) : []
      }))
    );
  }

  // Create new exam
  createExam(exam: Partial<Exam>): Observable<Exam> {
    const examToCreate = {
      ...exam,
      isActive: true,
      teacherId: exam.teacherId || '1',
      updatedAt: new Date(),
      subject: exam.subject || 'General' // Ensure subject is included, with a default
    };
    return this.http.post<any>(this.apiUrl, examToCreate).pipe(
      map(newExam => ({
        ...newExam,
        id: newExam._id,
        isActive: true,
        teacherId: newExam.teacherId || '1',
        updatedAt: newExam.updatedAt || newExam.createdAt
      }))
    );
  }

  // Update exam
  updateExam(id: string, exam: Partial<Exam>): Observable<Exam> {
    const examToUpdate = {
      ...exam,
      updatedAt: new Date(),
      subject: exam.subject // Ensure subject can be updated
    };
    return this.http.patch<any>(`${this.apiUrl}/${id}`, examToUpdate).pipe(
      map(updatedExam => ({
        ...updatedExam,
        id: updatedExam._id,
        isActive: true,
        teacherId: updatedExam.teacherId || '1',
        updatedAt: updatedExam.updatedAt || updatedExam.createdAt
      }))
    );
  }

  // Delete exam
  deleteExam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get student results
  getStudentResults(studentId: string): Observable<ExamResult[]> {
    return this.http.get<ExamResult[]>(`${this.apiUrl.replace('/exams', '')}/users/profile/exam-results`);
  }

  // Get student dashboard stats
  getStudentDashboardStats(studentId: string): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl.replace('/exams', '')}/users/dashboard/stats`);
  }

  // Submit exam answers
  submitExamAnswers(examId: string, studentId: string, answers: any[]): Observable<ExamResult> {
    const submissionData = {
      studentId,
      answers
    };
    return this.http.post<any>(`${this.apiUrl}/${examId}/submit`, submissionData).pipe(
      map(result => ({
        ...result,
        id: result._id
      }))
    );
  }

  // Get subject scores
  getSubjectScores(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl.replace('/exams', '')}/users/dashboard/subject-scores`);
  }
}

