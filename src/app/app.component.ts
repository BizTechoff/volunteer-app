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

  explicit = [] as string[]

  @DataControl<AppComponent, Branch>({
    click: (_, f) => {
      Branch.selectBranch(_.explicit, async (r, b) => {
        await r.auth.swithToBranch(b)
        r.refresh();
      })(_, f)
    },
    getValue: (_, f) => f.value ? `מציג רק את סניף ${f.value?.name}` : 'מציג את כל הסניפים'
  })
  @Field({ caption: 'סניף ראשי לתצוגה' })
  branch: Branch = undefined!;

  getBG() {
    let result = ''
    if (!this.router || this.router.url === "/" || this.router.url === "/" + encodeURI(terms.home)) {
      result = 'linear-gradient(180deg, #2CBCC1, #F69A48)'//'url(assets/logo_eshel.png)'// 'linear-gradient(180deg, #2CBCC1, #F69A48)'
    }
    return result
  }

  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private routeHelper: RouteHelperService,
    public dialogService: DialogService,
    public remult: Remult,
    public auth: AuthService) {
    // console.log('AppComponent READY')
  }
  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    // console.log('ngOnInit.this.router.url-0', this.router.url)
    if (this.auth.isConnected) {
      await this.setSelectedBranch()
      if (this.remult.user.isVolunteer) {
        // console.log(this.router.url)
        if (['/', ''].includes(this.router.url))
        // if ur l ==== '/' - first time only
        {
          this.router.navigateByUrl(terms.myTenants)
        }
      }
    }
    // console.log('AppComponent INIT')
  }

  showRemultUser(e: MouseEvent) {
    try {
      if (e.ctrlKey) { alert(JSON.stringify(this.remult.user)) }
    }
    catch (err) { console.log(err) }
  }

  async setSelectedBranch() {
    if (this.remult.user.branch && this.remult.user.branch.length > 0) {
      this.branch = await this.remult.repo(Branch).findId(this.remult.user.branch)
    }
  }

  async refresh() {
    window?.location?.reload()
  }

  isVolunteer() {
    return this.remult.user.roles.length == 1 && this.remult.isAllowed(Roles.volunteer);
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove
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
    let connected = await openDialog(UserLoginComponent,
      _ => { },
      _ => _ ? _.args.out.connected : false
    );
    if (connected) {
      await this.setSelectedBranch()
    }
  }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }

  @Field()
  branchesManagers: { id: string, manager: string }[] = [] as { id: string, manager: string }[]

  private async signUp() {
    let user = this.remult.repo(Users).create();
    // user.bid = undefined;// only admin should be here
    user.volunteer = true;
    let password = new PasswordControl();
    let confirmPassword = new PasswordControl(terms.confirmPassword);
    // for await (const u of this.remult.repo(Users).query({ where: { manager: true } })) {
    //   this.branchesManagers.push({ id: u.bid!.id, manager: u.name })
    // } 
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.signUp,
      fields: () => {
        let f = []
        f.push(
          user.$.bid!,//this.$.branchesManagers,
          user.$.name,
          user.$.mobile,
          user.$.email)
        return f
      },
      ok: async () => {
        if (password.value != confirmPassword.value) {
          confirmPassword.error = terms.doesNotMatchPassword;
          throw new Error(confirmPassword.metadata.caption + " " + confirmPassword.error);
        }
        await user.create(password.value);
        this.signIn()
      }
    });
  }

  async updateInfo() {
    let user = await this.remult.repo(Users).findId(this.remult.user.id);
    openDialog(InputAreaComponent, i => i.args = {
      title: terms.updateInfo,
      fields: () => [
        { field: user.$.bid, readonly: true, visible: _ => !this.remult.user.isBoardOrAbove },
        { field: user.$.branch2, readonly: true, visible: _ => this.remult.user.isVolunteerMultiBrnach },
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
