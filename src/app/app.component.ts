import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { InputField, openDialog, RouteHelperService } from '@remult/angular';
import { Remult } from 'remult';
import { AuthService } from './auth.service';
import { DialogService } from './common/dialog';
import { InputAreaComponent } from './common/input-area/input-area.component';
import { Branch } from './core/branch/branch';
import { terms } from './terms';
import { Roles } from './users/roles';
import { PasswordControl, Users } from './users/users';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private routeHelper: RouteHelperService,
    public dialogService: DialogService,
    public remult: Remult,
    public auth: AuthService) {


  }
  terms = terms;

  forgotPassword = false;
  async signIn() {
    let user = new InputField<string>({ caption: terms.username });
    let password = new PasswordControl();
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.signIn,
      fields: () => [
        user,
        password
      ],
      ok: async () => {
        this.auth.signIn(user.value, password.value);
      }
    });
  }
 
  usersCount = 0;
  async ngOnInit() {
    // this.usersCount = await this.remult.repo(Users).count();
  }

  getUserBrnachDesc() {
    if (this.isValidBidId()) {
      if (this.remult.user.bid !== '0') {
        return `סניף: ${this.remult.user.bid}`;
      }
    }
    return '';
  }

  isValidBidId() {
    let bid = this.remult.user.bid;
    if (bid && bid.length) {
      if (bid.trim() === '0') {
        if (!this.remult.isAllowed(Roles.board)) {
          return false;
        }
      }
      return true;
    }
    return false;
  } 
 
  async getUserAuthName() {
    let result = 'לא מורשה';
    if (this.remult.user.roles.find(r => r === Roles.admin)) {
      result = 'אדמין';
    }
    else if (this.remult.user.roles.find(r => r === Roles.board)) {
      result = 'הנהלה'; 
    }
    else if (this.remult.user.roles.find(r => r === Roles.manager)) {
      let name = this.remult.user.bid;// await this.remult.repo(Branch).findId(this.remult.user.bid);
      result = 'מנהל סניף ' + name;
    } 
    else if (this.remult.user.roles.find(r => r === Roles.volunteer)) {
      let name = this.remult.user.bid;// await this.remult.repo(Branch).findId(this.remult.user.bid);
      result = 'מתנדב בסניף ' + name;
    }
    return result;
  }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
  signUp() {
    let user = this.remult.repo(Users).create();
    let password = new PasswordControl();
    let confirmPassword = new PasswordControl(terms.confirmPassword);
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.signUp,
      fields: () => [
        user.$.name,
        user.$.mobile,
        password,
        confirmPassword
      ],
      ok: async () => {
        if (password.value != confirmPassword.value) {
          confirmPassword.error = terms.doesNotMatchPassword;
          throw new Error(confirmPassword.metadata.caption + " " + confirmPassword.error);
        }
        user.bid = undefined;// only admin should be here
        await user.create(password.value);
        this.auth.signIn(user.name, password.value);

      }
    });
  }

  async updateInfo() {
    let user = await this.remult.repo(Users).findId(this.remult.user.id);
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.updateInfo,
      fields: () => [
        user.$.name
      ],
      ok: async () => {
        await user._.save();
      }
    });
  }
  async changePassword() {
    let user = await this.remult.repo(Users).findId(this.remult.user.id);
    let password = new PasswordControl();
    let confirmPassword = new PasswordControl(terms.confirmPassword);
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.changePassword,
      fields: () => [
        password,
        confirmPassword
      ],
      ok: async () => {
        if (password.value != confirmPassword.value) {
          confirmPassword.error = terms.doesNotMatchPassword;
          throw new Error(confirmPassword.metadata.caption + " " + confirmPassword.error);
        }
        await user.updatePassword(password.value);
        await user._.save();
      }
    });

  }

  routeName(route: Route) {
    let name = route.path;
    if (route.data && route.data.name)
      name = route.data.name;
    return name;
  }


  currentTitle() {
    if (this.activeRoute!.snapshot && this.activeRoute!.firstChild)
      if (this.activeRoute.snapshot.firstChild!.data!.name) {
        return this.activeRoute.snapshot.firstChild!.data.name;
      }
      else {
        if (this.activeRoute.firstChild.routeConfig)
          return this.activeRoute.firstChild.routeConfig.path;
      }
    return terms.volunteerApp;
  }
 
  shouldDisplayRoute(route: Route) {
    if (!(route.path && route.path.indexOf(':') < 0 && route.path.indexOf('**') < 0))
      return false;
    return this.routeHelper.canNavigateToRoute(route);
  }
  //@ts-ignore ignoring this to match angular 7 and 8
  @ViewChild('sidenav') sidenav: MatSidenav;
  routeClicked() {
    if (this.dialogService.isScreenSmall())
      this.sidenav.close();

  }


}
