import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, DashboardStats, Exam, ExamResult } from '../../models/interfaces';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule]
})
export class StudentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  dashboardStats: DashboardStats | null = null;
  availableExams: Exam[] = [];
  completedExams: ExamResult[] = [];
  subjectScores: any[] = [];
  isLoading = true;
  
  // Animation states
  statsLoaded = false;
  examsLoaded = false;
  chartsLoaded = false;

  // Bar Chart Configuration
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Subject Scores'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  // Pie Chart Configuration
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4CAF50', '#F44336'], // Green for Passed, Red for Failed
        hoverBackgroundColor: ['#66BB6A', '#EF5350']
      }
    ]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: false,
        text: 'Pass/Fail Ratio'
      }
    }
  };

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.statsLoaded = false;
    this.examsLoaded = false;
    this.chartsLoaded = false;

    const studentId = this.currentUser.id;

    forkJoin([
      this.examService.getStudentDashboardStats(studentId),
      this.examService.getAvailableExams(),
      this.examService.getStudentResults(studentId),
      this.examService.getSubjectScores(studentId)
    ]).subscribe({
      next: ([dashboardStats, availableExams, completedExams, subjectScores]) => {
        // Dashboard Stats
        this.dashboardStats = dashboardStats;
        console.log('Dashboard Stats:', this.dashboardStats);
        this.statsLoaded = true;

        // Available Exams
        this.availableExams = availableExams;
        console.log('Available Exams:', this.availableExams);
        this.examsLoaded = true;

        // Completed Exams
        this.completedExams = completedExams;
        console.log('Completed Exams on Student Dashboard:', this.completedExams);

        // Subject Scores
        this.subjectScores = subjectScores;
        console.log('Subject Scores:', this.subjectScores);

        // Update charts and set loaded flag
        this.updateChartData();
        this.chartsLoaded = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  startExam(examId: string): void {
    this.router.navigate(['/exam', examId]);
  }

  viewResults(examId?: string, resultId?: string): void {
    // If specific exam and result IDs are provided, navigate to a detailed results page
    if (examId && resultId) {
      this.router.navigate(['/results', examId, resultId]);
    } else {
      // Otherwise, navigate to a general results overview (if applicable)
      this.router.navigate(['/results']);
    }
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

  getScorePercentage(result: ExamResult): number {
    return Math.round((result.score / result.totalPoints) * 100);
  }

  updateChartData() {
    this.barChartData.labels = this.subjectScores.map(subject => subject.subject);
    this.barChartData.datasets[0].data = this.subjectScores.map(subject => subject.score);
    this.barChartData.datasets[0].backgroundColor = this.subjectScores.map(subject => subject.color);
    this.barChartData.datasets[0].borderColor = this.subjectScores.map(subject => subject.color);

    if (this.dashboardStats) {
      this.pieChartData.datasets[0].data = [this.dashboardStats.passedExams, this.dashboardStats.failedExams];
      console.log("Pie Chart Data:", this.pieChartData);
    }
  }
}

