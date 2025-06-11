import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { Exam, Question } from '../../models/interfaces';

@Component({
  selector: 'app-exam-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-management.component.html',
  styleUrl: './exam-management.component.css'
})
export class ExamManagementComponent implements OnInit {
  isEditMode = false;
  examId: string | null = null;
  String = String;
  Number = Number;
  
  exam: Partial<Exam> = {
    title: '',
    description: '',
    duration: 60,
    questions: [],
    isActive: true
  };

  currentQuestion: Partial<Question> = {
    text: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 5
  };

  showQuestionForm = false;
  editingQuestionIndex = -1;
  isLoading = false;

  questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True or False' },
    { value: 'essay', label: 'Essay' }
  ];

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.examId = params['edit'];
        this.loadExam(this.examId);
      }
    });
  }

  private loadExam(examId: string | null): void {
    if (!examId) return;
    this.isLoading = true;
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = { ...exam };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.isLoading = false;
      }
    });
  }

  addQuestion(): void {
    this.resetQuestionForm();
    this.showQuestionForm = true;
    this.editingQuestionIndex = -1;
  }

  editQuestion(index: number): void {
    const question = this.exam.questions![index];
    this.currentQuestion = { ...question };
    this.showQuestionForm = true;
    this.editingQuestionIndex = index;
  }

  saveQuestion(): void {
    if (!this.validateQuestion()) {
      return;
    }

    const question: Partial<Question> = {
      text: this.currentQuestion.text!,
      question: this.currentQuestion.text!,
      type: this.currentQuestion.type!,
      options: this.currentQuestion.type === 'multiple-choice' ? this.currentQuestion.options! : [],
      correctAnswer: this.currentQuestion.correctAnswer!,
      points: this.currentQuestion.points!
    };

    if (this.editingQuestionIndex >= 0 && this.currentQuestion.id) {
      question.id = this.currentQuestion.id;
    }

    if (!this.exam.questions) {
      this.exam.questions = [];
    }

    if (this.editingQuestionIndex >= 0) {
      this.exam.questions[this.editingQuestionIndex] = question as Question;
    } else {
      this.exam.questions.push(question as Question);
    }

    this.cancelQuestionForm();
  }

  deleteQuestion(index: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.exam.questions!.splice(index, 1);
    }
  }

  cancelQuestionForm(): void {
    this.showQuestionForm = false;
    this.resetQuestionForm();
    this.editingQuestionIndex = -1;
  }

  private resetQuestionForm(): void {
    this.currentQuestion = {
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 5
    };
  }

  private validateQuestion(): boolean {
    if (!this.currentQuestion.text?.trim()) {
      alert('Please enter the question text');
      return false;
    }

    if (this.currentQuestion.type === 'multiple-choice') {
      const validOptions = this.currentQuestion.options?.filter(opt => opt.trim()) || [];
      if (validOptions.length < 2) {
        alert('Please enter at least two options for the question');
        return false;
      }
    }

    if (this.currentQuestion.points! <= 0) {
      alert('Please enter valid points for the question');
      return false;
    }

    return true;
  }

  saveExam(): void {
    if (!this.validateExam()) {
      return;
    }

    this.isLoading = true;
    
    if (this.isEditMode && this.examId) {
      this.examService.updateExam(this.examId, this.exam).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Exam updated successfully');
          this.router.navigate(['/teacher-dashboard']);
        },
        error: (error) => {
          console.error('Error updating exam:', error);
          this.isLoading = false;
          alert('Error updating exam');
        }
      });
    } else {
      this.examService.createExam(this.exam).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Exam created successfully');
          this.router.navigate(['/teacher-dashboard']);
        },
        error: (error) => {
          console.error('Error creating exam:', error);
          this.isLoading = false;
          alert('Error creating exam');
        }
      });
    }
  }

  private validateExam(): boolean {
    if (!this.exam.title?.trim()) {
      alert('Please enter the exam title');
      return false;
    }

    if (!this.exam.description?.trim()) {
      alert('Please enter the exam description');
      return false;
    }

    if (!this.exam.duration || this.exam.duration <= 0) {
      alert('Please enter a valid exam duration');
      return false;
    }

    if (!this.exam.questions || this.exam.questions.length === 0) {
      alert('Please add at least one question');
      return false;
    }

    return true;
  }

  cancel(): void {
    this.router.navigate(['/teacher-dashboard']);
  }

  addOption(): void {
    if (this.currentQuestion.options) {
      this.currentQuestion.options.push('');
    }
  }

  removeOption(index: number): void {
    if (this.currentQuestion.options) {
      this.currentQuestion.options.splice(index, 1);
    }
  }

  getTotalPoints(): number {
    return this.exam.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
  }

  getQuestionTypeLabel(type: string): string {
    return this.questionTypes.find(t => t.value === type)?.label || type;
  }

  trackByFn(index: number, item: any): number {
    return index;
  }
}

