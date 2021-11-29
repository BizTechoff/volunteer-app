import { ErrorHandler, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { NotAuthenticatedGuard, RemultModule } from '@remult/angular';
import { AuthService } from './auth.service';
import { ShowDialogOnErrorErrorHandler } from './common/dialog';
import { ActivitiesListComponent } from './core/activity/activities-list/activities-list.component';
import { BranchesListComponent } from './core/branch/branches-list/branches-list.component';
import { CalendarComponent } from './core/current-state/calendar/calendar.component';
import { CurrentStateComponent } from './core/current-state/current-state.component';
import { PhotosAlbumBranchComponent } from './core/photo/photos-album-branch/photos-album-branch.component';
import { TenantsListComponent } from './core/tenant/tenants-list/tenants-list.component';
import { VolunteerActivitiesComponent } from './core/volunteer/volunteer-activities/volunteer-activities.component';
import { VolunteerDetailsComponent } from './core/volunteer/volunteer-details/volunteer-details.component';
import { VolunteerTenantsComponent } from './core/volunteer/volunteer-tenants/volunteer-tenants.component';
import { VolunteersListComponent } from './core/volunteer/volunteers-list/volunteers-list.component';
import { HomeComponent } from './home/home.component';
import { ActivityDailyComponent } from './reports/activity-daily/activity-daily.component';
import { terms } from './terms';
import { AdminGuard, BoardGuard, ManagerGuard, OnlyVolunteerGuard, VolunteerGuard } from './users/roles';
import { UsersComponent } from './users/users.component';

 

const defaultRoute = terms.home;
const routes: Routes = [ 
  { path: defaultRoute, component: HomeComponent, canActivate: [NotAuthenticatedGuard] },
  // { path: terms.calendar, component: CalendarComponent, canActivate: [ManagerGuard] },
  { path: terms.currentState, component: CurrentStateComponent, canActivate: [ManagerGuard] },
  { path: terms.activities, component: ActivitiesListComponent, canActivate: [ManagerGuard] },
  { path: terms.tenants, component: TenantsListComponent, canActivate: [ManagerGuard] },
  { path: terms.volunteers, component: VolunteersListComponent, canActivate: [ManagerGuard] },
  { path: terms.dailyActivityReport, component: ActivityDailyComponent, canActivate: [ManagerGuard] },
  { path: terms.myActivities, component: VolunteerActivitiesComponent, canActivate: [OnlyVolunteerGuard] },
  { path: terms.myTenants, component: VolunteerTenantsComponent, canActivate: [OnlyVolunteerGuard] },
  { path: terms.personalInfo, component: VolunteerDetailsComponent, canActivate: [OnlyVolunteerGuard] },
  { path: terms.photoAlbum, component: PhotosAlbumBranchComponent, canActivate: [VolunteerGuard] },
  { path: terms.branches, component: BranchesListComponent, canActivate: [AdminGuard] },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/' + defaultRoute, pathMatch: 'full' }

]; 

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RemultModule,
  JwtModule.forRoot({
    config: { tokenGetter: () => AuthService.fromStorage() }
  })],
  providers: [AdminGuard, BoardGuard, ManagerGuard, VolunteerGuard, OnlyVolunteerGuard, { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }

