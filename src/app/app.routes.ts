import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { ExamComponent } from './components/exam/exam.component';
import { ResultsComponent } from './components/results/results.component';
import { ExamManagementComponent } from './components/exam-management/exam-management.component';
import { AuthGuard, StudentGuard, TeacherGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'student-dashboard', 
    component: StudentDashboardComponent,
    canActivate: [StudentGuard]
  },
  { 
    path: 'teacher-dashboard', 
    component: TeacherDashboardComponent,
    canActivate: [TeacherGuard]
  },
  { 
    path: 'exam/:id', 
    component: ExamComponent,
    canActivate: [StudentGuard]
  },
  { 
    path: 'results', 
    component: ResultsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'exam-management', 
    component: ExamManagementComponent,
    canActivate: [TeacherGuard]
  },
  { path: '**', redirectTo: '/login' }
];
