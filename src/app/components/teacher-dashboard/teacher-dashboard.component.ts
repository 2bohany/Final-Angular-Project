import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, Exam } from '../../models/interfaces';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  currentUser: User | null = null;
  teacherExams: Exam[] = [];
  teacherStats = {
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    averageScore: 0
  };
  isLoading = true;
  
  // Animation states
  statsLoaded = false;
  examsLoaded = false;

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Load teacher's exams
      setTimeout(() => {
        this.examService.getAvailableExams().subscribe(exams => {
          this.teacherExams = exams.filter(exam => exam.teacherId === this.currentUser!.id);
          this.calculateStats();
          this.examsLoaded = true;
        });
      }, 300);

      // Load stats with animation delay
      setTimeout(() => {
        this.statsLoaded = true;
        this.isLoading = false;
      }, 600);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    }
  }

  private calculateStats(): void {
    this.teacherStats.totalExams = this.teacherExams.length;
    this.teacherStats.activeExams = this.teacherExams.filter(exam => exam.isActive).length;
    this.teacherStats.totalStudents = Math.floor(Math.random() * 100) + 50; // Mock data
    this.teacherStats.averageScore = Math.floor(Math.random() * 30) + 70; // Mock data
  }

  createNewExam(): void {
    this.router.navigate(['/exam-management']);
  }

  editExam(examId: string): void {
    this.router.navigate(['/exam-management'], { queryParams: { edit: examId } });
  }

  viewExamResults(examId: string): void {
    this.router.navigate(['/results'], { queryParams: { exam: examId } });
  }

  toggleExamStatus(exam: Exam): void {
    exam.isActive = !exam.isActive;
    // In a real app, this would call a service to update the exam
    console.log(`Exam ${exam.title} is now ${exam.isActive ? 'active' : 'inactive'}`);
  }

  deleteExam(examId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      this.teacherExams = this.teacherExams.filter(exam => exam.id !== examId);
      this.calculateStats();
      // In a real app, this would call a service to delete the exam
      console.log(`Exam ${examId} deleted`);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getExamStatusColor(isActive: boolean): string {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }

  getExamStatusText(isActive: boolean): string {
    return isActive ? 'نشط' : 'غير نشط';
  }
}

