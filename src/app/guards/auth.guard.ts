import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn() && this.authService.isStudent()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TeacherGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn() && this.authService.isTeacher()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

