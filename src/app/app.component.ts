import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DataControl, openDialog, RouteHelperService } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { AuthService } from './auth.service';
import { DialogService } from './common/dialog';
import { InputAreaComponent } from './common/input-area/input-area.component';
import { Branch } from './core/branch/branch';
import { terms } from './terms';
import { Roles } from './users/roles';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { PasswordControl, Users } from './users/users';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // isMultiBrnachEnabled = true;
  explicit = [] as string[]

  @DataControl<AppComponent, Branch>({
    click: (_, f) => {
      Branch.selectBranch(_.explicit, async (r, b) => {
        await r.auth.swithToBranch(b)
        r.refresh();
      })(_, f)
    },
    getValue: (_, f) => f.value ? `מציג רק את סניף ${f.value?.name}` : 'מציג את כל הסניפים',
    // click: Branch.selectBranch([], async (r, b) => {
    //   await r.auth.swithToBranch(b)
    //   r.refresh();
    // })
  })
  @Field({ caption: 'סניף לתצוגה' })
  branch: Branch = undefined!;

  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private routeHelper: RouteHelperService,
    public dialogService: DialogService,
    public remult: Remult,
    public auth: AuthService) {
      console.log('constructor', remult.user)
    // console.log({ a: remult.repo(Tenant).metadata.fields.modifiedBy.valueType });
  }
  terms = terms;
  get $() { return getFields(this, this.remult) };

  usersCount = 0;
  async ngOnInit() {
    console.log('ngOnInit.this.router.url-0', this.router.url)
    // this.usersCount = await this.remult.repo(Users).count();
    if (this.auth.isConnected) {
      await this.setSelectedBranch()
      // this.setMultiBranches();
    }
    // this.refresh()
    // console.log(this.explicit)
  }

  async setSelectedBranch(){
    if (this.remult.user.bid && this.remult.user.bid.length > 0) {
      this.branch = await this.remult.repo(Branch).findId(this.remult.user.bid)
      console.log('ngOnInit', this.remult.user.bid)
    }
  }

  async refresh() {
    window?.location?.reload()
  }

  isVolunteer() {
    return this.remult.user.roles.length == 1 && this.remult.isAllowed(Roles.volunteer);
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async switchBranch() {
    if (this.branch && this.branch.id.length > 0) {
      await this.auth.swithToBranch(this.branch.id)
      window?.location?.reload();
      this.dialogService.info('סניף הוחלף בהצלחה');
    }
  }
 
  showBizTechoff() {
    window.open('https://biztechoff.co.il', '_blank');
  }

  routeHome() {
    window.location.href = encodeURI("/ברוכים הבאים")
  }

  async routeToeDefault() {
    if (this.router.url.length < 3 || this.router.url.includes(terms.home)) {
      this.routeHelper.navigateToComponent((await import('./core/volunteer/volunteer-activities/volunteer-activities.component')).VolunteerActivitiesComponent)
    }
  }

  forgotPassword = false;
  async signIn() {
    // this.isMultiBrnachEnabled = false;
    let connected = await openDialog(UserLoginComponent,
      _ => { },
      _ => _ ? _.args.out.connected : false
    );
    if (connected) {
      await this.setSelectedBranch()
    //   this.setMultiBranches();


    }
  }

  // setMultiBranches() {
  //   // this.explicit.splice(0)
  //   // console.log(JSON.stringify(this.remult.user))
  //   // console.log('bid2', this.remult.user.bid2)
  //   this.explicit.splice(0)
  //   this.isMultiBrnachEnabled = false;
  //   if (this.isVolunteer()) {
  //     if (this.remult.user.bid2) {
  //       if (this.remult.user.bid2.length > 0) {
  //         this.isMultiBrnachEnabled = true
  //         this.explicit.push(this.remult.user.bid)
  //         this.explicit.push(this.remult.user.bid2)
  //       }
  //     }
  //   }
  //   else if (this.isBoard()) {
  //     this.isMultiBrnachEnabled = true;
  //   }
  //   // if (this.isVolunteer()) {
  //   //   console.log('this.router.url-2',this.router.url)
  //   //   if(this.router.url.length < 3 || this.router.url.includes(terms.home)){
  //   //     this.routeHelper.navigateToComponent((await import('./core/volunteer/volunteer-activities/volunteer-activities.component')).VolunteerActivitiesComponent)
  //   //   }
  //   //   //
  //   //   // if (!this.router.getCurrentNavigation()?.finalUrl) {
  //   //   //   this.routeHelper.navigateToComponent((await import('./core/volunteer/volunteer-activities/volunteer-activities.component')).VolunteerActivitiesComponent)
  //   //   // }
  //   // }
  // }

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

  // getUserAuthName() {
  //   let result = 'לא מורשה';
  //   if (this.remult.user.roles.find(r => r === Roles.admin)) {
  //     result = 'אדמין';
  //   }
  //   else if (this.remult.user.roles.find(r => r === Roles.donor)) {
  //     result = 'תורם';
  //   }
  //   else if (this.remult.user.roles.find(r => r === Roles.board)) {
  //     result = 'הנהלה';
  //   }
  //   else if (this.remult.user.roles.find(r => r === Roles.manager)) {
  //     let name = this.remult.user.bid;// await this.remult.repo(Branch).findId(this.remult.user.bid);
  //     result = 'מנהל ב' + this.remult.user.bname;
  //   }
  //   else if (this.remult.user.roles.find(r => r === Roles.volunteer)) {
  //     let name = this.remult.user.bid;// await this.remult.repo(Branch).findId(this.remult.user.bid);
  //     result = 'מתנדב ב' + this.remult.user.bname;
  //   }
  //   return result;
  // }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
  
  signUp() {
    let user = this.remult.repo(Users).create();
    // user.bid = undefined;// only admin should be here
    user.volunteer = true;
    let password = new PasswordControl();
    let confirmPassword = new PasswordControl(terms.confirmPassword);
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.signUp,
      fields: () => [
        user.$.bid!,
        user.$.name,
        user.$.mobile,
        user.$.email
        // password,
        // confirmPassword
      ],
      ok: async () => {
        if (password.value != confirmPassword.value) {
          confirmPassword.error = terms.doesNotMatchPassword;
          throw new Error(confirmPassword.metadata.caption + " " + confirmPassword.error);
        }
        await user.create(password.value);
        this.signIn()
        // await this.auth.signIn(user.mobile);//, password.value);

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
