import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { Exam, Question, User } from '../../models/interfaces';

@Component({
  selector: 'app-exam',
  imports: [CommonModule, FormsModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  currentUser: User | null = null;
  currentQuestionIndex = 0;
  answers: { [questionId: string]: any } = {};
  timeRemaining = 0;
  timerInterval: any;
  isLoading = true;
  isSubmitting = false;
  examStarted = false;
  examCompleted = false;
  
  // Animation states
  questionLoaded = false;

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const examId = this.route.snapshot.paramMap.get('id');
    
    if (examId) {
      this.loadExam(examId);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadExam(examId: string): void {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = exam;
          this.timeRemaining = exam.duration * 60; // Convert to seconds
          this.isLoading = false;
        } else {
          this.router.navigate(['/student-dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.router.navigate(['/student-dashboard']);
      }
    });
  }

  startExam(): void {
    this.examStarted = true;
    this.questionLoaded = true;
    this.startTimer();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.submitExam();
      }
    }, 1000);
  }

  selectAnswer(questionId: string, answer: any): void {
    this.answers[questionId] = answer;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.exam!.questions.length - 1) {
      this.currentQuestionIndex++;
      this.questionLoaded = false;
      setTimeout(() => {
        this.questionLoaded = true;
      }, 100);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.questionLoaded = false;
      setTimeout(() => {
        this.questionLoaded = true;
      }, 100);
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    this.questionLoaded = false;
    setTimeout(() => {
      this.questionLoaded = true;
    }, 100);
  }

  submitExam(): void {
    if (this.isSubmitting) return;

    if (!this.isAllQuestionsAnswered() && this.timeRemaining > 0) {
      if (!confirm('لم تجب على جميع الأسئلة. هل أنت متأكد من تسليم الامتحان؟')) {
        return;
      }
    }

    this.isSubmitting = true;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Prepare answers array
    const answersArray = this.exam!.questions.map(question => ({
      questionId: question.id,
      answer: this.answers[question.id] !== undefined ? this.answers[question.id] : null
    }));

    this.examService.submitExamAnswers(this.exam!.id, this.currentUser!.id, answersArray).subscribe({
      next: (result) => {
        this.examCompleted = true;
        this.isSubmitting = false;
        
        // Navigate to results after a delay
        setTimeout(() => {
          this.router.navigate(['/results'], { 
            queryParams: { 
              examId: this.exam!.id,
              resultId: result.id 
            } 
          });
        }, 3000);
      },
      error: (error) => {
        console.error('Error submitting exam:', error);
        this.isSubmitting = false;
        alert('حدث خطأ أثناء تسليم الامتحان. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  isAllQuestionsAnswered(): boolean {
    return this.exam!.questions.every(question => 
      this.answers[question.id] !== undefined
    );
  }

  getAnsweredQuestionsCount(): number {
    return this.exam!.questions.filter(question => 
      this.answers[question.id] !== undefined
    ).length;
  }

  getProgressPercentage(): number {
    return Math.round((this.getAnsweredQuestionsCount() / this.exam!.questions.length) * 100);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeColor(): string {
    const percentage = (this.timeRemaining / (this.exam!.duration * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  }

  getCurrentQuestion(): Question {
    return this.exam!.questions[this.currentQuestionIndex];
  }

  isQuestionAnswered(questionId: string): boolean {
    return this.answers[questionId] !== undefined;
  }

  exitExam(): void {
    if (confirm('هل أنت متأكد من الخروج من الامتحان؟ ستفقد جميع إجاباتك.')) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.router.navigate(['/student-dashboard']);
    }
  }

  getTotalPoints(): number {
    if (!this.exam) return 0;
    return this.exam.questions.reduce((sum, q) => sum + q.points, 0);
  }

  getStringFromCharCode(code: number): string {
    return String.fromCharCode(code);
  }
}

