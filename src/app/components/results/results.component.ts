import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, ExamResult, Exam } from '../../models/interfaces';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  currentUser: User | null = null;
  results: ExamResult[] = [];
  selectedResult: ExamResult | null = null;
  selectedExam: Exam | null = null;
  isLoading = true;
  showDetails = false;
  examIdFromRoute: string | null = null;
  selectedExamTitle: string = 'Exam Results';
  
  // Animation states
  resultsLoaded = false;
  detailsLoaded = false;

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.route.queryParams.subscribe(params => {
      this.examIdFromRoute = params['exam'];
      if (this.examIdFromRoute) {
        this.loadExamResultsForTeacher(this.examIdFromRoute);
      } else if (this.currentUser && this.currentUser.role === 'student') {
        this.loadResults();
      } else if (this.currentUser && this.currentUser.role === 'teacher'){
        this.isLoading = false;
        this.resultsLoaded = true;
      }
    });
  }

  private loadResults(): void {
    if (!this.currentUser) return;

    this.examService.getStudentResults(this.currentUser.id).subscribe({
      next: (results) => {
        console.log('Results received in ResultsComponent:', results);
        this.results = results.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        this.isLoading = false;
        
        setTimeout(() => {
          this.resultsLoaded = true;
        }, 300);
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.isLoading = false;
      }
    });
  }

  private loadExamResultsForTeacher(examId: string): void {
    this.isLoading = true;
    this.examService.getExamResultsForTeacher(examId).subscribe({
      next: (results) => {
        this.results = results;
        this.examService.getExamById(examId).subscribe(exam => {
          if (exam) {
            this.selectedExamTitle = exam.title;
          }
          this.isLoading = false;
          this.resultsLoaded = true;
        });
      },
      error: (error) => {
        console.error('Error loading exam results for teacher:', error);
        this.isLoading = false;
      }
    });
  }

  private showSpecificResult(resultId: string): void {
    const result = this.results.find(r => r.id === resultId);
    if (result) {
      this.viewDetails(result);
    }
  }

  viewDetails(result: ExamResult): void {
    if (!result.examId) {
      console.warn('Attempted to view details for a result with a null examId:', result);
      // Optionally, show a message to the user or prevent opening details
      return;
    }

    this.selectedResult = result;
    this.showDetails = true;
    this.detailsLoaded = false;
    
    // Load exam details
    this.examService.getExamById(result.examId.id).subscribe({
      next: (exam) => {
        this.selectedExam = exam || null;
        setTimeout(() => {
          this.detailsLoaded = true;
        }, 200);
      },
      error: (error) => {
        console.error('Error loading exam details:', error);
      }
    });
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedResult = null;
    this.selectedExam = null;
    this.detailsLoaded = false;
  }

  getScorePercentage(result: ExamResult): number {
    return Math.round((result.score / result.totalPoints) * 100);
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  getScoreBgColor(percentage: number): string {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 80) return 'bg-blue-100';
    if (percentage >= 70) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  }

  getGrade(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Accepted';
    return 'Fail';
  }

  getPassStatus(percentage: number): { text: string; color: string; bgColor: string } {
    if (percentage >= 60) {
      return { text: 'success', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else {
      return { text: 'failed', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  }

  isAnswerCorrect(questionId: string, userAnswer: any): boolean {
    if (!this.selectedExam) return false;
    
    const question = this.selectedExam.questions.find(q => q.id === questionId);
    return question ? question.correctAnswer === userAnswer : false;
  }

  getQuestionById(questionId: string): any {
    if (!this.selectedExam) return null;
    return this.selectedExam.questions.find(q => q.id === questionId);
  }

  getUserAnswer(questionId: string): any {
    if (!this.selectedResult) return null;
    
    const answer = this.selectedResult.answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : null;
  }

  getAnswerText(question: any, answerIndex: any): string {
    if (question.type === 'multiple-choice' && question.options) {
      return question.options[answerIndex] || 'Not answered';
    } else if (question.type === 'true-false') {
      return answerIndex === 0 ? 'True' : answerIndex === 1 ? 'False' : 'Not answered';
    }
    return 'Not answered';
  }

  getCorrectAnswerText(question: any): string {
    if (question.type === 'multiple-choice' && question.options) {
      return question.options[question.correctAnswer] || 'Not answered';
    } else if (question.type === 'true-false') {
      return question.correctAnswer === 0 ? 'True' : 'False';
    }
    return 'Not answered';
  }

  goBack(): void {
    if (this.examIdFromRoute) {
      this.router.navigate(['/teacher-dashboard']);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  getOverallStats(): any {
    if (this.results.length === 0) {
      return { totalExams: 0, averageScore: 0, passedExams: 0, failedExams: 0 };
    }

    const totalExams = this.results.length;
    const averageScore = Math.round(
      this.results.reduce((sum, result) => sum + this.getScorePercentage(result), 0) / totalExams
    );
    const passedExams = this.results.filter(result => this.getScorePercentage(result) >= 60).length;
    const failedExams = totalExams - passedExams;

    return { totalExams, averageScore, passedExams, failedExams };
  }
}

