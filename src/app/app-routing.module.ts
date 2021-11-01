import { NotAuthenticatedGuard, RemultModule } from '@remult/angular';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


import { UsersComponent } from './users/users.component';
import { AdminGuard, BoardGuard, ManagerGuard, VolunteerGuard } from './users/roles';
import { ShowDialogOnErrorErrorHandler } from './common/dialog';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { terms } from './terms';
import { CurrentStateComponent } from './core/current-state/current-state.component';
import { TenantsListComponent } from './core/tenant/tenants-list/tenants-list.component';
import { VolunteersListComponent } from './core/volunteer/volunteers-list/volunteers-list.component';
import { ActivitiesListComponent } from './core/activity/activities-list/activities-list.component';
  
const defaultRoute = terms.home;
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent, canActivate: [NotAuthenticatedGuard] },
  { path: terms.currentState, component: CurrentStateComponent, canActivate: [AdminGuard] },
  { path: terms.activities, component: ActivitiesListComponent, canActivate: [AdminGuard] },
  { path: terms.tenants, component: TenantsListComponent, canActivate: [AdminGuard] },
  { path: terms.volunteers, component: VolunteersListComponent, canActivate: [AdminGuard] },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/'+defaultRoute, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RemultModule,
  JwtModule.forRoot({
    config: { tokenGetter: () => AuthService.fromStorage() }
  })],
  providers: [AdminGuard, BoardGuard, ManagerGuard, VolunteerGuard, { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }

