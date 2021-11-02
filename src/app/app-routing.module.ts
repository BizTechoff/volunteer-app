import { NotAuthenticatedGuard, RemultModule } from '@remult/angular';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


import { UsersComponent } from './users/users.component';
import { AdminGuard, BoardGuard, ManagerGuard, OnlyVolunteerGuard, VolunteerGuard } from './users/roles';
import { ShowDialogOnErrorErrorHandler } from './common/dialog';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { terms } from './terms';
import { CurrentStateComponent } from './core/current-state/current-state.component';
import { TenantsListComponent } from './core/tenant/tenants-list/tenants-list.component';
import { VolunteersListComponent } from './core/volunteer/volunteers-list/volunteers-list.component';
import { ActivitiesListComponent } from './core/activity/activities-list/activities-list.component';
import { VolunteerActivitiesComponent } from './core/volunteer/volunteer-activities/volunteer-activities.component';
import { VolunteerDetailsComponent } from './core/volunteer/volunteer-details/volunteer-details.component';
  
const defaultRoute = terms.home;
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent, canActivate: [NotAuthenticatedGuard] },
  { path: terms.currentState, component: CurrentStateComponent, canActivate: [ManagerGuard] },
  { path: terms.activities, component: ActivitiesListComponent, canActivate: [ManagerGuard] },
  { path: terms.tenants, component: TenantsListComponent, canActivate: [ManagerGuard] },
  { path: terms.volunteers, component: VolunteersListComponent, canActivate: [ManagerGuard] },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: terms.myActivities, component: VolunteerActivitiesComponent, canActivate: [OnlyVolunteerGuard] },
  { path: terms.personalInfo, component: VolunteerDetailsComponent, canActivate: [OnlyVolunteerGuard] },
  { path: '**', redirectTo: '/'+defaultRoute, pathMatch: 'full' }

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

