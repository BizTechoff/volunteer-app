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
import { MatSelectModule } from '@angular/material/select';
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
import { SelectTenantComponentComponent } from './common/select-tenant-component/select-tenant-component.component';
import { YesNoQuestionComponent } from './common/yes-no-question/yes-no-question.component';
import { ActivitiesListComponent } from './core/activity/activities-list/activities-list.component';
import { ActivityDetailsComponent } from './core/activity/activity-details/activity-details.component';
import { CurrentStateComponent } from './core/current-state/current-state.component';
import { PhotosAlbumComponent } from './core/photo/photos-album/photos-album.component';
import { TenantDetailsComponent } from './core/tenant/tenant-details/tenant-details.component';
import { TenantsListComponent } from './core/tenant/tenants-list/tenants-list.component';
import { VolunteerActivitiesComponent } from './core/volunteer/volunteer-activities/volunteer-activities.component';
import { VolunteerDetailsComponent } from './core/volunteer/volunteer-details/volunteer-details.component';
import { VolunteersAssignmentComponent } from './core/volunteer/volunteers-assignment/volunteers-assignment.component';
import { VolunteersListComponent } from './core/volunteer/volunteers-list/volunteers-list.component';
import { HomeComponent } from './home/home.component';
import { ActivityDailyComponent } from './reports/activity-daily/activity-daily.component';
import { AdminGuard, BoardGuard, DonorGuard, ManagerGuard, OnlyVolunteerGuard, VolunteerGuard } from './users/roles';
import { UsersComponent } from './users/users.component';
import { SelectVolunteersComponent } from './common/select-volunteers/select-volunteers.component';
import { SelectLangsComponent } from './common/select-langs/select-langs.component';
import { SelectReferrerComponent } from './common/select-referrer/select-referrer.component';
import { BranchesListComponent } from './core/branch/branches-list/branches-list.component';
import { SelectBranchComponent } from './common/select-branch/select-branch.component';
import { SelectPurposesComponent } from './common/select-purposes/select-purposes.component';
import { PhotosAlbumBranchComponent } from './core/photo/photos-album-branch/photos-album-branch.component';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { NotificationsListComponent } from './core/notification/notifications-list/notifications-list.component';

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
    ActivityDetailsComponent,
    VolunteerActivitiesComponent,
    ActivityDailyComponent,
    VolunteersAssignmentComponent,
    PhotosAlbumComponent,
    SelectTenantComponentComponent,
    SelectVolunteersComponent,
    SelectLangsComponent,
    SelectReferrerComponent,
    BranchesListComponent,
    SelectBranchComponent,
    SelectPurposesComponent,
    PhotosAlbumBranchComponent,
    UserLoginComponent,
    NotificationsListComponent
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
    ChartsModule,
    MatSelectModule
  ],
  providers: [DialogService, AdminGuard, DonorGuard, BoardGuard, ManagerGuard, VolunteerGuard, OnlyVolunteerGuard],
  bootstrap: [AppComponent],
  entryComponents: [YesNoQuestionComponent, InputAreaComponent, ActivityDetailsComponent, VolunteersAssignmentComponent,
    SelectVolunteersComponent, SelectTenantComponentComponent, SelectLangsComponent,
    UserLoginComponent]//, SelectReferrerComponent]
})
export class AppModule { }
 