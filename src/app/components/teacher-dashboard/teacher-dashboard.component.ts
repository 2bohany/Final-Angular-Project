import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, Exam } from '../../models/interfaces';

@Component({
  selector: 'app-teacher-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Manually trigger change detection because of OnPush strategy
      this.cdr.detectChanges();
    });
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    console.log('loadDashboardData called');
    if (!this.currentUser) {
      console.log('No current user, returning.');
      return;
    }

    try {
      console.log('Attempting to load teacher exams...');
      // Load teacher's exams
      this.examService.getAllExams().subscribe({
        next: (exams) => {
          console.log('Teacher exams loaded successfully:', exams);
          this.teacherExams = exams;
          this.examsLoaded = true;
          this.calculateExamStats(); // Calculate stats based on fetched exams
          this.checkLoadingStatus();
        },
        error: (err) => {
          console.error('Error fetching teacher exams:', err);
          // Handle error appropriately, e.g., show a message to the user
          this.isLoading = false;
        }
      });

      console.log('Attempting to load teacher statistics...');
      // Load teacher statistics
      this.authService.getTeacherDashboardStats().subscribe({
        next: (stats) => {
          console.log('Teacher dashboard stats loaded successfully:', stats);
          this.teacherStats.totalStudents = stats.totalStudents;
          this.teacherStats.averageScore = stats.averageScore;
          this.statsLoaded = true;
          this.checkLoadingStatus();
        },
        error: (err) => {
          console.error('Error fetching teacher dashboard stats:', err);
          // Handle error appropriately
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    }
  }

  private calculateExamStats(): void {
    this.teacherStats.totalExams = this.teacherExams.length;
    this.teacherStats.activeExams = this.teacherExams.filter(exam => exam.isActive).length;
  }

  private checkLoadingStatus(): void {
    if (this.examsLoaded && this.statsLoaded) {
      this.isLoading = false;
      this.cdr.detectChanges(); // Ensure UI updates once all data is loaded
      console.log('All dashboard data loaded. isLoading set to false.');
    }
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
    const newStatus = !exam.isActive;
    this.examService.updateExam(exam.id, { isActive: newStatus }).subscribe({
      next: (updatedExam) => {
        // Find the index of the updated exam and replace it in the array
        const index = this.teacherExams.findIndex(e => e.id === updatedExam.id);
        if (index !== -1) {
          this.teacherExams = [...this.teacherExams.slice(0, index), updatedExam, ...this.teacherExams.slice(index + 1)];
          this.calculateExamStats(); // Recalculate stats after update
          this.cdr.detectChanges(); // Manually trigger change detection
        }
        console.log(`Exam ${updatedExam.title} is now ${updatedExam.isActive ? 'active' : 'inactive'} and updated in DB and UI.`);
        console.log('Updated exam in array:', this.teacherExams[index]);
      },
      error: (err) => {
        console.error('Error updating exam status:', err);
        // Optionally, revert the frontend state if the update fails
        // exam.isActive = !newStatus;
      }
    });
  }

  deleteExam(examId: string): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(examId).subscribe({
        next: () => {
          this.teacherExams = this.teacherExams.filter(exam => exam.id !== examId);
          this.calculateExamStats();
          this.cdr.detectChanges(); // Trigger change detection to update UI
          console.log(`Exam ${examId} deleted successfully from DB and UI.`);
        },
        error: (err) => {
          console.error('Error deleting exam:', err);
          // Optionally, show an error message to the user
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getExamStatusColor(isActive: boolean): string {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }

  getExamStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  trackByExamId(index: number, exam: Exam): string {
    return exam.id; // Or exam._id if your Exam interface uses _id
  }

  debugLog(...args: any[]): void {
    console.log(...args);
  }

  // Helper to get absolute image URL
  getAbsoluteImageUrl(relativePath: string | undefined): string {
    if (relativePath) {
      // Assuming your backend is running on http://localhost:3000
      return `http://localhost:3000${relativePath}`;
    }
    return ''; // Or a placeholder image path
  }
}

