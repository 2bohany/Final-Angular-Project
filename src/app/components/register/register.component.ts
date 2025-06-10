import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/interfaces';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerData: RegisterRequest = {
    email: '',
    password: '',
    name: '',
    role: 'student'
  };
  
  confirmPassword = '';
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
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.redirectToDashboard();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
      }
    });
  }

  private validateForm(): boolean {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.confirmPassword) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return false;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين';
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
      return false;
    }

    return true;
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'student') {
      this.router.navigate(['/student-dashboard']);
    } else if (user?.role === 'teacher') {
      this.router.navigate(['/teacher-dashboard']);
    }
  }
}

