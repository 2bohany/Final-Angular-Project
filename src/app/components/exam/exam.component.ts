import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam, Question } from '../../models/interfaces';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  examId: string = '';
  currentQuestionIndex: number = 0;
  answers: { [key: string]: number } = {};
  timeRemaining: number = 0;
  examStarted: boolean = false;
  examCompleted: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  questionLoaded: boolean = false;
  private timerSubscription?: Subscription;
  private examStartTime?: Date;
  private currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['id'];
    this.currentUser = this.authService.getCurrentUser();
    this.loadExam();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  private loadExam(): void {
    this.isLoading = true;
    this.examService.getExamById(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.timeRemaining = exam.duration * 60; // Convert minutes to seconds
        this.isLoading = false;
        this.questionLoaded = true;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  startExam(): void {
    if (!this.exam) return;

    this.examStarted = true;
    this.examStartTime = new Date();
    this.startTimer();

    // Log exam start
    console.log('Exam started:', {
      examId: this.examId,
      startTime: this.examStartTime,
      duration: this.exam.duration,
      totalQuestions: this.exam.questions.length
    });
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.timeRemaining > 0 && !this.examCompleted))
      .subscribe(() => {
        this.timeRemaining--;
        if (this.timeRemaining === 0) {
          this.submitExam();
        }
      });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeColor(): string {
    if (this.timeRemaining <= 300) { // 5 minutes
      return 'text-red-600';
    } else if (this.timeRemaining <= 600) { // 10 minutes
      return 'text-yellow-600';
    }
    return 'text-blue-600';
  }

  getCurrentQuestion(): Question {
    return this.exam!.questions[this.currentQuestionIndex];
  }

  selectAnswer(questionId: string, answerIndex: number): void {
    this.answers[questionId] = answerIndex;
    console.log('Answer selected:', { questionId, answerIndex, answers: this.answers });
  }

  isQuestionAnswered(questionId: string): boolean {
    return this.answers[questionId] !== undefined;
  }

  getAnsweredQuestionsCount(): number {
    return Object.keys(this.answers).length;
  }

  getProgressPercentage(): number {
    if (!this.exam) return 0;
    return Math.round((this.getAnsweredQuestionsCount() / this.exam.questions.length) * 100);
  }

  getTotalPoints(): number {
    if (!this.exam) return 0;
    return this.exam.questions.reduce((total, question) => total + question.points, 0);
  }

  getStringFromCharCode(code: number): string {
    return String.fromCharCode(code);
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.questionLoaded = false;
      setTimeout(() => {
        this.questionLoaded = true;
      }, 300);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.exam!.questions.length - 1) {
      this.currentQuestionIndex++;
      this.questionLoaded = false;
      setTimeout(() => {
        this.questionLoaded = true;
      }, 300);
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.exam!.questions.length) {
      this.currentQuestionIndex = index;
      this.questionLoaded = false;
      setTimeout(() => {
        this.questionLoaded = true;
      }, 300);
    }
  }

  submitExam(): void {
    if (this.isSubmitting || !this.exam || !this.currentUser) return;

    this.isSubmitting = true;
    const examEndTime = new Date();
    const examDuration = this.examStartTime ? 
      Math.round((examEndTime.getTime() - this.examStartTime.getTime()) / 1000) : 0;

    // Convert answers to the format expected by the backend
    const answersArray = Object.entries(this.answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    console.log('Submitting exam:', {
      examId: this.examId,
      userId: this.currentUser.id,
      answers: answersArray,
      duration: examDuration,
      startTime: this.examStartTime,
      endTime: examEndTime
    });

    this.examService.submitExamAnswers(this.examId, this.currentUser.id, answersArray).subscribe({
      next: (response) => {
        console.log('Exam submitted successfully:', response);
        this.examCompleted = true;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error submitting exam:', error);
        this.isSubmitting = false;
        // Show error message to user
        alert('There was an error submitting your exam. Please try again.');
      }
    });
  }

  exitExam(): void {
    if (this.examStarted && !this.examCompleted) {
      if (confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
