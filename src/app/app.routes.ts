import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { ExamComponent } from './components/exam/exam.component';
import { ResultsComponent } from './components/results/results.component';
import { ExamManagementComponent } from './components/exam-management/exam-management.component';
import { ManageStudentsComponent } from './components/manage-students/manage-students.component';
import { ViewReportsComponent } from './components/view-reports/view-reports.component';
import { AuthGuard, StudentGuard, TeacherGuard } from './guards/auth.guard';
import { TeacherProfileComponent } from './components/teacher-profile/teacher-profile.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';

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
  {
    path: 'manage-students',
    component: ManageStudentsComponent,
    canActivate: [TeacherGuard]
  },
  {
    path: 'view-reports',
    component: ViewReportsComponent,
    canActivate: [TeacherGuard]
  },
  {
    path: 'teacher-profile',
    component: TeacherProfileComponent,
    canActivate: [TeacherGuard]
  },
  {
    path: 'student-profile',
    component: StudentProfileComponent,
    canActivate: [StudentGuard]
  },
  { path: '**', redirectTo: '/login' }
];
