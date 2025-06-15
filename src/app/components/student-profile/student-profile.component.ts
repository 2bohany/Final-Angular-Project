import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css']
})
export class StudentProfileComponent implements OnInit {
  currentUser: User | null = null;
  studentProfile: Partial<User> = {};
  isEditMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.studentProfile = { ...this.currentUser };
        this.studentProfile.profileImage = this.currentUser.profileImage;
        this.studentProfile.backgroundImage = this.currentUser.backgroundImage;
        console.log('StudentProfileComponent: currentUser from subscription:', this.currentUser);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.currentUser) {
      this.studentProfile = { ...this.currentUser };
    }
  }

  saveProfile(): void {
    if (this.studentProfile.name && this.studentProfile.email) {
      if (this.currentUser) {
        const updatedUser: Partial<User> = {
          name: this.studentProfile.name,
          email: this.studentProfile.email,
          bio: this.studentProfile.bio,
          profileImage: this.studentProfile.profileImage,
          backgroundImage: this.studentProfile.backgroundImage
        };

        this.authService.updateProfile(updatedUser).subscribe({
          next: (responseUser) => {
            this.currentUser = responseUser.user;
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

  getAbsoluteImageUrl(relativePath: string | undefined): string {
    if (relativePath) {
      return `http://localhost:3000${relativePath}`;
    }
    return '';
  }

  onFileSelected(event: any, type: 'profile' | 'background'): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'profile') {
          this.studentProfile.profileImage = e.target.result;
        } else {
          this.studentProfile.backgroundImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
