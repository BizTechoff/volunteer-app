import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusyService, openDialog } from '@remult/angular';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { SelectCallComponent } from '../../../common/select-call/select-call.component';
import { SelectNavigatorComponent } from '../../../common/select-navigator/select-navigator.component';
import { SelectTenantComponent } from '../../../common/select-tenant/select-tenant.component';
import { DateUtils } from '../../../common/utils';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Activity, ActivityStatus } from '../../activity/activity';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { Branch } from '../../branch/branch';
import { Tenant } from '../../tenant/tenant';
import { TenantsQuery } from '../tenants-query';

@Component({
  selector: 'app-volunteer-tenants',
  templateUrl: './volunteer-tenants.component.html',
  styleUrls: ['./volunteer-tenants.component.scss']
})
export class VolunteerTenantsComponent implements OnInit {
  searchString = '';
  originTenants = [] as Tenant[]
  tenants = [] as Tenant[]
  // this.remult.repo(Tenant),
  // {
  //   where: {
  //     bid: this.remult.branchAllowedForUser(),
  //     name: this.searchString ? { $contains: this.searchString } : { $contains: this.searchString },
  //     // defVids: { $contains: this.remult.user.id }
  //   },
  //   columnSettings: row => [
  //     row.name,
  //     // row.defVids,
  //     row.age,
  //     row.mobile,
  //     row.langs,
  //     row.address
  //   ],
  //   gridButtons: [
  //     {
  //       textInMenu: () => terms.refresh,
  //       icon: 'refresh',
  //       click: async () => { await this.refresh(); }
  //     }
  //   ],
  //   rowButtons: [
  //     {
  //       visible: (_) => !_.isNew() && !this.isDonor(),
  //       textInMenu: terms.addActivity,
  //       icon: 'add',
  //       click: async (_) => await this.openActivity(_)
  //     }
  //   ]
  // });
  userMessage = terms.loadingYourTenants;
  constructor(private remult: Remult, private router: Router, private busy: BusyService, private dialog: DialogService) { }
  terms = terms;
  async ngOnInit() {
    await this.refresh();
  }

  isDonor() {
    return this.remult.user.isReadOnly;
  }

  async refresh() {
    this.userMessage = terms.loadingYourTenants;
    // await this.tenants.reloadData();
    // this.tenants.splice(0)
    //     let startDayOfWeek = new Date()
    //     startDayOfWeek = new Date(
    //       startDayOfWeek.getFullYear(),
    //       startDayOfWeek.getMonth(),
    //       startDayOfWeek.getDate() - startDayOfWeek.getDay());
    //     let endDayOfWeek = new Date()
    //     endDayOfWeek = new Date(
    //       endDayOfWeek.getFullYear(),
    //       endDayOfWeek.getMonth(),
    //       startDayOfWeek.getDate() + 7 - 1);
    // console.log(startDayOfWeek,' - ::-', endDayOfWeek)
    this.tenants = await TenantsQuery.noActivity(
      // this.remult.user.branch,
      // startDayOfWeek,
      // endDayOfWeek,
      this.searchString
    )
    // this.originTenants.splice(0)
    // // let ids = [] as string[]
    // for await (const t of this.remult.repo(Tenant).query({
    //   where: {
    //     bid: this.remult.branchAllowedForUser(),
    //     name: this.searchString ? { $contains: this.searchString } : { $contains: this.searchString },
    //     // defVids: { $contains: this.remult.user.id }
    //   }
    // })) {
    //   this.originTenants.push(t)
    //   // if (!ids.includes(t.id)) {
    //   //   ids.push(t.id)
    //   //   this.tenants.push(t)
    //   // }
    // }
    // this.tenants = this.originTenants
    // if (this.tenants.length === 0) {
    //   this.tenants.push(...this.originTenants)
    // }

    // console.log('this.tenants.items.length', this.tenants.length)
    if (this.tenants.length === 0) {
      this.userMessage = terms.volunteerNoTenants;
    }
    else {
      this.userMessage = ''
    }
  }

  @BackendMethod({ allowed: Roles.volunteer })
  async tenantsByBidAndSearch() {

    // where: {
    //   bid: this.remult.branchAllowedForUser(),
    //   name: this.searchString ? { $contains: this.searchString } : { $contains: this.searchString },
    //   // defVids: { $contains: this.remult.user.id }
    // },
  }

  async doSearch() {
    await this.refresh()
    // if (this.searchString.length > 0) {
    //   this.tenants = this.originTenants.filter(t => t.name.includes(this.searchString))
    //   if (!this.tenants) {
    //     this.tenants = [] as Tenant[]
    //   }
    // }
    // else {
    //   this.tenants = this.originTenants
    // }
    // await this.busy.donotWait(async () => await this.refresh());
  }

  async removeTenant(t: Tenant) {
    if (t && t.defVids && t.defVids.length > 0) {
      let f = t.defVids.find(row => row.id === this.remult.user.id);
      if (f) {
        let yes = await this.dialog.yesNoQuestion('האם להסר את שיוכך מהדייר ' + t.name)
        if (yes) {
          let i = t.defVids.indexOf(f);
          t.defVids.splice(i, 1);
          await t.save()
          await this.refresh()
        }
      }
    }
  }

  async addTenant() {
    let newT: Tenant = undefined!;
    await openDialog(SelectTenantComponent,
      async x => x.args = {
        ignoreDefVids: true,
        title: 'דייר חדש לדיירים שלי',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
        bid: await this.remult.repo(Branch).findId(this.remult.user.branch),
        onSelect: t => newT = t
      })
    if (newT) {
      // console.log(2)
      let yes = await this.dialog.yesNoQuestion('האם לשייך לך את ' + newT.name)
      if (yes) {
        let f = newT.defVids.find(row => row.id === this.remult.user.id);
        if (!f) {
          newT.defVids.push({ id: this.remult.user.id, name: this.remult.user.name });
          await newT.save()
          await this.refresh()
          yes = await this.dialog.yesNoQuestion(`הדייר שוייך בהצלחה. האם ברצונך להקים פעילות חדשה עם ${newT.name}`)
          if (yes) {
            this.openActivity(newT)
          }
        }
        else {
          this.dialog.info('דייר זה כבר משוייך לך')
        }
      }
    }
    // console.log(3)
  }

  getTanantRemark(t: Tenant) {
    let result = ''
    if (t.apartment && t.apartment.length > 0) {
      result += ` דירה ${t.apartment} `
    }

    if (t.floor && t.floor.length > 0) {
      result += ` קומה ${t.floor} `
    }

    if (t.addressRemark && t.addressRemark.length > 0) {
      result += ` ${t.addressRemark} `
    }
    return result.trim()
  }

  // async openPhotosAlbum(t: Tenant) {
  //   let changes = await openDialog(PhotosAlbumComponent,
  //     _ => _.args = { bid: t.bid, aid: '', tid: t.id },
  //     _ => _ ? _.args.changed : false);
  //   if (changes) {
  //     // await this.refresh();
  //   }
  // }

  getLang(a: Tenant) {
    let result = 'לא צויינו';
    if (a && a.langs.length > 0) {
      result = a.langs.map(l => l.caption).join(', ');
    }
    return result;
  }


  async navigate(a: Tenant) {
    let nav = undefined
    if (a.address) {
      nav = await openDialog(SelectNavigatorComponent,
        dlg => dlg.args = { address: a.address },
        dlg => dlg ? dlg.args.selected : undefined)
    }
    if (nav) {
      // a.wazed = new Date();
      // await a.save();
      nav.args?.click(a?.address)
    }
  }
  async call(a: Tenant) {
    let number = ''
    if (a.mobile && a.phone) {
      number = await openDialog(SelectCallComponent,
        dlg => dlg.args = { options: [a.mobile, a.phone] },
        dlg => dlg ? dlg.args.selected! : '')
    }
    else if (a.mobile) {
      number = a.mobile
    }
    else if (a.phone) {
      number = a.phone
    }
    if (number && number.length > 0) {
      // a.called = new Date();
      // await a.save();
      let url = `tel:${number}`;
      window.open(url, '_blank');
    }
  }

  async openActivity(tnt: Tenant) {

    let as = [] as Activity[];
    for await (const a of this.remult.repo(Activity).query({
      where: {
        bid: this.remult.branchAllowedForUser(),
        status: { $ne: [ActivityStatus.cancel] },
        vids: { $contains: this.remult.user.id }
      },
      orderBy: { status: "asc", date: "asc", fh: "asc", th: "asc" }
    })) {
      await a.$.tid.load();
      as.push(a);
    }

    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (const a of as) {
      if (a.date < today) {
        if (ActivityStatus.openStatuses().includes(a.status)) {
          await this.dialog.error(terms.mustCloseOldActivities.replace('!date!', DateUtils.toDateString(a.date)));
          return;
        }
      }
    }

    tnt = await this.remult.repo(Tenant).findId(tnt.id)

    // where: {
    //   status:  [ActivityStatus.openStatuses()],
    //   date: { '<': today }
    // },

    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt },
      _ => _ ? _.args.changed : false);
    if (changes) {
      let f = tnt.defVids.find(v => v.id === this.remult.user.id)
      if (!f) {
        tnt.defVids.push({ id: this.remult.user.id, name: this.remult.user.name })
        // console.log(1213)
        // console.log('tnt',tnt )
        await tnt.save()
        // console.log(3121)
      }
      this.router.navigateByUrl(`${terms.myActivities}`)
      // await this.refresh();
    }
  }

}
