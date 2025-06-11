import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    BrowserModule,
    NgChartsModule,
    HttpClientModule,
    FormsModule,
    AppComponent,
    StudentDashboardComponent
  ],
  providers: []
})
export class AppModule { } 