import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { SelectCallComponent } from '../../../common/select-call/select-call.component';
import { SelectNavigatorComponent } from '../../../common/select-navigator/select-navigator.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';
import { Tenant } from '../../tenant/tenant';

@Component({
  selector: 'app-volunteer-tenants',
  templateUrl: './volunteer-tenants.component.html',
  styleUrls: ['./volunteer-tenants.component.scss']
})
export class VolunteerTenantsComponent implements OnInit {

  tenants = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: {
        bid: this.remult.branchAllowedForUser(),
        defVids: { $contains: this.remult.user.id }
      },
      columnSettings: row => [
        row.name,
        // row.defVids,
        row.age,
        row.mobile,
        row.langs,
        row.address
      ],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.addActivity,
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        }
      ]
    });
  userMessage = terms.loadingYourTenants;
  constructor(private remult: Remult) { }
  terms = terms;
  async ngOnInit() {
    await this.refresh();
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }

  async refresh() {
    this.userMessage = terms.loadingYourTenants;
    await this.tenants.reloadData();
    if (this.tenants.items.length == 0) {
      this.userMessage = terms.volunteerNoTenants;
    }
  }

  async openPhotosAlbum(t: Tenant) {
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: t.bid, aid: '', tid: t.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

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
        dlg => dlg.args = {},
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
    else if (a.mobile){
      number = a.mobile
    }
    else if (a.phone){
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

    // where: {
    //   status:  [ActivityStatus.openStatuses()],
    //   date: { '<': today }
    // },

    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

}
