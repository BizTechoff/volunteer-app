import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RemultModule } from '@remult/angular';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogService } from './common/dialog';
import { InputAreaComponent } from './common/input-area/input-area.component';
import { YesNoQuestionComponent } from './common/yes-no-question/yes-no-question.component';
import { ActivitiesListComponent } from './core/activity/activities-list/activities-list.component';
import { ActivityDetailsComponent } from './core/activity/activity-details/activity-details.component';
import { CurrentStateComponent } from './core/current-state/current-state.component';
import { TenantDetailsComponent } from './core/tenant/tenant-details/tenant-details.component';
import { TenantsListComponent } from './core/tenant/tenants-list/tenants-list.component';
import { VolunteerDetailsComponent } from './core/volunteer/volunteer-details/volunteer-details.component';
import { VolunteersListComponent } from './core/volunteer/volunteers-list/volunteers-list.component';
import { HomeComponent } from './home/home.component';
import { AdminGuard, BoardGuard, ManagerGuard, VolunteerGuard } from './users/roles';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    HomeComponent,
    YesNoQuestionComponent,
    InputAreaComponent,
    CurrentStateComponent,
    ActivitiesListComponent,
    TenantsListComponent,
    TenantDetailsComponent,
    VolunteersListComponent,
    VolunteerDetailsComponent,
    ActivityDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RemultModule,
    BrowserAnimationsModule,
    ChartsModule
  ],
  providers: [DialogService, AdminGuard, BoardGuard, ManagerGuard, VolunteerGuard],
  bootstrap: [AppComponent],
  entryComponents: [YesNoQuestionComponent, InputAreaComponent, ActivityDetailsComponent]
})
export class AppModule { }
