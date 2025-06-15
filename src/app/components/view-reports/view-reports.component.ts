import { Component, OnInit } from '@angular/core';
import { ExamService } from '../../services/exam.service';
import { StudentPerformance } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.css'
})
export class ViewReportsComponent implements OnInit {
  studentPerformances: StudentPerformance[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private studentId: string | null = null;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.studentId = params['studentId'];
      this.loadStudentPerformances();
    });
  }

  loadStudentPerformances(): void {
    this.isLoading = true;
    this.examService.getAllStudentPerformances().subscribe({
      next: (data) => {
        if (this.studentId) {
          this.studentPerformances = data.filter(s => s.studentId === this.studentId);
        } else {
          this.studentPerformances = data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load student performance reports.';
        this.isLoading = false;
        console.error('Error fetching student performance reports:', err);
      }
    });
  }

  returnToManageStudents(): void {
    this.router.navigate(['/manage-students']);
  }
}
