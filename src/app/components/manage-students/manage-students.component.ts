import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, StudentPerformance } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-students',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-students.component.html',
  styleUrl: './manage-students.component.css'
})
export class ManageStudentsComponent implements OnInit {
  studentPerformances: StudentPerformance[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStudentPerformances();
  }

  loadStudentPerformances(): void {
    this.isLoading = true;
    this.examService.getAllStudentPerformances().subscribe({
      next: (data) => {
        this.studentPerformances = data;
        this.isLoading = false;
        console.log('Student performances loaded:', this.studentPerformances);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load student performances.';
        this.isLoading = false;
        console.error('Error fetching student performances:', err);
      }
    });
  }

  viewStudentDetails(studentId: string): void {
    this.router.navigate(['/view-reports'], { queryParams: { studentId: studentId } });
  }

  returnToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }
}
