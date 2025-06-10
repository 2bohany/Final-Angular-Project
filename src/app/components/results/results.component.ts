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
    this.loadResults();
    
    // Check if we're viewing a specific result
    this.route.queryParams.subscribe(params => {
      if (params['resultId']) {
        this.showSpecificResult(params['resultId']);
      }
    });
  }

  private loadResults(): void {
    if (!this.currentUser) return;

    this.examService.getStudentResults(this.currentUser.id).subscribe({
      next: (results) => {
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

  private showSpecificResult(resultId: string): void {
    const result = this.results.find(r => r.id === resultId);
    if (result) {
      this.viewDetails(result);
    }
  }

  viewDetails(result: ExamResult): void {
    this.selectedResult = result;
    this.showDetails = true;
    this.detailsLoaded = false;
    
    // Load exam details
    this.examService.getExamById(result.examId).subscribe({
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
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 60) return 'مقبول';
    return 'راسب';
  }

  getPassStatus(percentage: number): { text: string; color: string; bgColor: string } {
    if (percentage >= 60) {
      return { text: 'نجح', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else {
      return { text: 'راسب', color: 'text-red-600', bgColor: 'bg-red-100' };
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
      return question.options[answerIndex] || 'غير محدد';
    } else if (question.type === 'true-false') {
      return answerIndex === 0 ? 'صح' : answerIndex === 1 ? 'خطأ' : 'غير محدد';
    }
    return 'غير محدد';
  }

  getCorrectAnswerText(question: any): string {
    if (question.type === 'multiple-choice' && question.options) {
      return question.options[question.correctAnswer] || 'غير محدد';
    } else if (question.type === 'true-false') {
      return question.correctAnswer === 0 ? 'صح' : 'خطأ';
    }
    return 'غير محدد';
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  retakeExam(examId: string): void {
    this.router.navigate(['/exam', examId]);
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

