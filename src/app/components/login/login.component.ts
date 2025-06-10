import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/interfaces';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  onSubmit(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.redirectToDashboard();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'بيانات الدخول غير صحيحة';
      }
    });
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'student') {
      this.router.navigate(['/student-dashboard']);
    } else if (user?.role === 'teacher') {
      this.router.navigate(['/teacher-dashboard']);
    }
  }

  // Demo credentials helper
  fillDemoCredentials(role: 'student' | 'teacher'): void {
    if (role === 'student') {
      this.loginData.email = 'student@example.com';
    } else {
      this.loginData.email = 'teacher@example.com';
    }
    this.loginData.password = 'password';
  }
}

