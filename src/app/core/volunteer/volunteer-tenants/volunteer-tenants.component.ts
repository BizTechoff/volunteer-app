import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { SelectCallComponent } from '../../../common/select-call/select-call.component';
import { SelectNavigatorComponent } from '../../../common/select-navigator/select-navigator.component';
import { SelectTenantComponent } from '../../../common/select-tenant/select-tenant.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { Branch } from '../../branch/branch';
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
  constructor(private remult: Remult, private dialog: DialogService) { }
  terms = terms;
  async ngOnInit() {
    await this.refresh();
  }

  isDonor() {
    return this.remult.user.isReadOnly;
  }

  async refresh() {
    this.userMessage = terms.loadingYourTenants;
    await this.tenants.reloadData();
    if (this.tenants.items.length == 0) {
      this.userMessage = terms.volunteerNoTenants;
    }
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
        bid: await this.remult.repo(Branch).findId(this.remult.user.bid),
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
        }
        else {
          this.dialog.info('דייר זה כבר משוייך לך')
        }
      }
    }
    // console.log(3)
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
