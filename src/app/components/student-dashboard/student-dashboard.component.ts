import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, DashboardStats, Exam } from '../../models/interfaces';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  dashboardStats: DashboardStats | null = null;
  availableExams: Exam[] = [];
  subjectScores: any[] = [];
  isLoading = true;
  
  // Animation states
  statsLoaded = false;
  examsLoaded = false;
  chartsLoaded = false;

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
      // Load stats with animation delay
      setTimeout(() => {
        this.examService.getStudentDashboardStats(this.currentUser!.id).subscribe(stats => {
          this.dashboardStats = stats;
          this.statsLoaded = true;
        });
      }, 300);

      // Load available exams
      setTimeout(() => {
        this.examService.getAvailableExams().subscribe(exams => {
          this.availableExams = exams;
          this.examsLoaded = true;
        });
      }, 600);

      // Load subject scores for charts
      setTimeout(() => {
        this.examService.getSubjectScores(this.currentUser!.id).subscribe(scores => {
          this.subjectScores = scores;
          this.chartsLoaded = true;
          this.isLoading = false;
        });
      }, 900);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    }
  }

  startExam(examId: string): void {
    this.router.navigate(['/exam', examId]);
  }

  viewResults(): void {
    this.router.navigate(['/results']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  getProgressWidth(score: number): string {
    return `${score}%`;
  }
}

