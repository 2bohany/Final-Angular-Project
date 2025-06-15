import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ExamService } from '../../services/exam.service';
import { User, Exam } from '../../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-profile.component.html',
  styleUrls: ['./teacher-profile.component.css']
})
export class TeacherProfileComponent implements OnInit {
  currentUser: User | null = null;
  teacherProfile: Partial<User> = {};
  isEditMode: boolean = false;
  recentExams: Exam[] = [];
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        // Only update teacherProfile if currentUser is not null
        this.teacherProfile = { ...this.currentUser };
        // Explicitly assign image properties to ensure they are not missed
        this.teacherProfile.profileImage = this.currentUser.profileImage;
        this.teacherProfile.backgroundImage = this.currentUser.backgroundImage;
        // Log to verify image path is present
        console.log('TeacherProfileComponent: currentUser from subscription:', this.currentUser);
        console.log('TeacherProfileComponent: teacherProfile.profileImage from subscription:', this.teacherProfile.profileImage);
        // If loadRecentExams needs to be called on user update, handle it here
        // Note: loadRecentExams is already called once in ngOnInit, consider if it needs to re-run on every user update
      } else {
        this.router.navigate(['/login']); // Redirect if no user is logged in
      }
    });

    // Initial load of recent exams can happen here or within the subscription if it depends on currentUser being available first
    if (this.authService.getCurrentUser()) {
      this.loadRecentExams(this.authService.getCurrentUser()!.id);
    }
  }

  loadRecentExams(teacherId: string): void {
    this.isLoading = true;
    this.examService.getAllExams().subscribe({
      next: (exams) => {
        // Filter exams by the current teacher and sort by createdAt descending
        this.recentExams = exams
          .filter(exam => exam.teacherId === teacherId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3); // Get only the last 3 exams
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent exams:', error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher-dashboard']);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.currentUser) {
      // If exiting edit mode, reset temporary changes unless saved
      this.teacherProfile = { ...this.currentUser };
    }
  }

  saveProfile(): void {
    if (this.teacherProfile.name && this.teacherProfile.email) {
      if (this.currentUser) {
        // Create a new user object with updated properties
        const updatedUser: Partial<User> = {
          name: this.teacherProfile.name,
          email: this.teacherProfile.email,
          bio: this.teacherProfile.bio,
          profileImage: this.teacherProfile.profileImage,
          backgroundImage: this.teacherProfile.backgroundImage
        };

        this.authService.updateProfile(updatedUser).subscribe({
          next: (responseUser) => {
            // The `setCurrentUser` is already called inside `updateProfile`'s tap operator
            this.currentUser = responseUser.user; // Update local currentUser with response from backend
            alert('Profile updated successfully!');
            this.isEditMode = false;
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
          }
        });

      }
    } else {
      alert('Name and Email are required.');
    }
  }

  // Helper to get absolute image URL
  getAbsoluteImageUrl(relativePath: string | undefined): string {
    if (relativePath) {
      // Assuming your backend is running on http://localhost:3000
      return `http://localhost:3000${relativePath}`;
    }
    return ''; // Or a placeholder image path
  }

  // Placeholder for image upload
  onFileSelected(event: any, type: 'profile' | 'background'): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'profile') {
          this.teacherProfile.profileImage = e.target.result;
        } else {
          this.teacherProfile.backgroundImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
