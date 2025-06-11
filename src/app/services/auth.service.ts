import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'student@example.com',
      name: 'Ahmed Mohamed',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      email: 'teacher@example.com',
      name: 'Dr. Fatima Ahmed',
      role: 'teacher',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock authentication
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password') {
      const authResponse: AuthResponse = {
        user,
        token: 'mock-jwt-token-' + user.id
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', authResponse.token);
      this.currentUserSubject.next(user);
      
      return of(authResponse).pipe(delay(1000)); // Simulate API delay
    }
    
    throw new Error('Invalid credentials');
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Mock registration
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockUsers.push(newUser);
    
    const authResponse: AuthResponse = {
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id
    };
    
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('token', authResponse.token);
    this.currentUserSubject.next(newUser);
    
    return of(authResponse).pipe(delay(1000)); // Simulate API delay
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'student';
  }

  isTeacher(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'teacher';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

