import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { Exam, Question } from '../../models/interfaces';

@Component({
  selector: 'app-exam-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-management.component.html',
  styleUrl: './exam-management.component.css'
})
export class ExamManagementComponent implements OnInit {
  isEditMode = false;
  examId: string | null = null;
  String = String;
  
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
    { value: 'multiple-choice', label: 'اختيار من متعدد' },
    { value: 'true-false', label: 'صح أم خطأ' },
    { value: 'essay', label: 'مقالي' }
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

    const question: Question = {
      id: this.currentQuestion.id || Date.now().toString(),
      text: this.currentQuestion.text!,
      type: this.currentQuestion.type!,
      options: this.currentQuestion.type === 'multiple-choice' ? this.currentQuestion.options : undefined,
      correctAnswer: this.currentQuestion.correctAnswer,
      points: this.currentQuestion.points!
    };

    if (!this.exam.questions) {
      this.exam.questions = [];
    }

    if (this.editingQuestionIndex >= 0) {
      this.exam.questions[this.editingQuestionIndex] = question;
    } else {
      this.exam.questions.push(question);
    }

    this.cancelQuestionForm();
  }

  deleteQuestion(index: number): void {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
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
      alert('يرجى إدخال نص السؤال');
      return false;
    }

    if (this.currentQuestion.type === 'multiple-choice') {
      const validOptions = this.currentQuestion.options?.filter(opt => opt.trim()) || [];
      if (validOptions.length < 2) {
        alert('يرجى إدخال خيارين على الأقل للسؤال');
        return false;
      }
    }

    if (this.currentQuestion.points! <= 0) {
      alert('يرجى إدخال نقاط صحيحة للسؤال');
      return false;
    }

    return true;
  }

  saveExam(): void {
    if (!this.validateExam()) {
      return;
    }

    this.isLoading = true;
    
    // In a real app, this would call the service to save the exam
    setTimeout(() => {
      this.isLoading = false;
      alert(this.isEditMode ? 'تم تحديث الامتحان بنجاح' : 'تم إنشاء الامتحان بنجاح');
      this.router.navigate(['/teacher-dashboard']);
    }, 1000);
  }

  private validateExam(): boolean {
    if (!this.exam.title?.trim()) {
      alert('يرجى إدخال عنوان الامتحان');
      return false;
    }

    if (!this.exam.description?.trim()) {
      alert('يرجى إدخال وصف الامتحان');
      return false;
    }

    if (!this.exam.duration || this.exam.duration <= 0) {
      alert('يرجى إدخال مدة صحيحة للامتحان');
      return false;
    }

    if (!this.exam.questions || this.exam.questions.length === 0) {
      alert('يرجى إضافة سؤال واحد على الأقل');
      return false;
    }

    return true;
  }

  cancel(): void {
    if (confirm('هل أنت متأكد من إلغاء العملية؟ ستفقد جميع التغييرات غير المحفوظة.')) {
      this.router.navigate(['/teacher-dashboard']);
    }
  }

  addOption(): void {
    if (this.currentQuestion.options && this.currentQuestion.options.length < 6) {
      this.currentQuestion.options.push('');
    }
  }

  removeOption(index: number): void {
    if (this.currentQuestion.options && this.currentQuestion.options.length > 2) {
      this.currentQuestion.options.splice(index, 1);
      if (typeof this.currentQuestion.correctAnswer === 'number' && 
          this.currentQuestion.correctAnswer >= this.currentQuestion.options.length) {
        this.currentQuestion.correctAnswer = 0;
      }
    }
  }

  getTotalPoints(): number {
    return this.exam.questions?.reduce((total, q) => total + q.points, 0) || 0;
  }

  getQuestionTypeLabel(type: string): string {
    const questionType = this.questionTypes.find(qt => qt.value === type);
    return questionType ? questionType.label : type;
  }
}

