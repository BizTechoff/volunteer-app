import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { FILTER_IGNORE } from '../../../common/globals';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { UserIdName } from '../../../common/types';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { Branch } from '../../branch/branch';
import { VolunteersAssignmentComponent } from '../../volunteer/volunteers-assignment/volunteers-assignment.component';
import { Tenant } from '../tenant';

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants-list.component.html',
  styleUrls: ['./tenants-list.component.scss']
})
export class TenantsListComponent implements OnInit {

  @DataControl<TenantsListComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;
  tenants: GridSettings<Tenant> = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: _ => (this.isBoard() ? FILTER_IGNORE : _.bid.contains(this.remult.user.bid))
        .and(this.search ? _.name.contains(this.search) : FILTER_IGNORE),
      allowCrud: false,
      numOfColumnsInGrid: 10,
      columnSettings: t => [
        { field: t.bid, visible: (r, v) => this.isBoard() },
        t.referrer,
        t.name,
        t.defVids,
        t.langs,
        t.address,
        t.mobile,
        t.birthday],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.associatedVolunteers,
          icon: 'search',
          click: async (_) => await this.assignVolunteers(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.tenantDetails,
          icon: 'edit',
          click: async (_) => await this.addTenant(_.id)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.showActivities,
          icon: 'list',
          click: async (_) => await this.showActivities(_)
        },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.addActivity,
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.transferTenant,
          icon: 'reply',
          click: async (_) => await this.transferTenant(_)
        },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.deleteTenant,
          icon: 'delete',//,
          // click: async (_) => await this.addTenant(_)
        }
      ]
    }
  );

  constructor(private remult: Remult, private dialog: DialogService) { }

  ngOnInit(): void {
  }

  async refresh() {
    await this.tenants.reloadData();
  }

  async assignVolunteers(t: Tenant) {

  }

  async transferTenant(t: Tenant) {

  }

  async showActivities(tnt: Tenant) {
    // let changes = await openDialog(ActivityDetailsComponent,
    //   _ => _.args = { bid: tnt.bid, tid: tnt.id },
    //   _ => _ ? _.args.changed : false);
    // if (changes) {
    //   await this.refresh();
    // }
  }

  async openActivity(tnt: Tenant) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }


  @Field({ caption: terms.age })
  age: number = 0;

  async addTenant(tid: string) {
    let isNew = false;
    let title = terms.tenantDetails;
    let t!: Tenant;
    if (tid && tid.length > 0) {
      t = await this.remult.repo(Tenant).findId(tid, { useCache: false });
    }
    if (!t) {
      title = terms.addTenant;
      t = this.remult.repo(Tenant).create();
      isNew = true;
      if (!this.isBoard()) {
        t.bid = await this.remult.repo(Branch).findId(this.remult.user.bid);
      }
    }
    console.log(t);
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: title,
        fields: () => [
          { field: t!.$.bid, visible: (r, v) => this.isBoard() },
          t!.$.referrer,
          t!.$.name,
          t!.$.mobile,
          t!.$.address,
          [
            { field: t!.$.birthday, valueChange: (r, v) => { this.age = t!.calcAge(); } },
            { field: this.$.age, width: '60', readonly: true }
          ],
          t!.$.langs,
          { field: t!.$.defVids, click: async () => await this.openVolunteers(t!) }],
        validate: async () => {
          return await this.canSaveAndClose(t);
        },
        ok: async () => {
          if (!this.isDonor()) {
            await t!.save();
          }
        }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
      // if (isNew) {
      //   if (await this.dialog.yesNoQuestion(terms.shouldAddActivity.replace('!t.name!', t.name))) {
      //     this.openActivity(t);
      //   }
      // }
    }
  }

  async canSaveAndClose(t: Tenant): Promise<boolean> {
    let result = true;
    let hasVids = (t.defVids && t.defVids.length > 0)!;
    if (!hasVids) {
      result = await this.dialog.yesNoQuestion(terms.notVolunteersForCurrentTenant);
    }
    return result;
  }

  async openVolunteers(t: Tenant) {
    let bidOk = (t && t.bid && t.bid.id && t.bid.id.length > 0)!;
    if (bidOk) {
      // t.defVids.splice(0);
      // let u = await this.remult.repo(Users).findFirst({ useCache: false });
      // t.defVids.push(u);
      if (!t.defVids) {
        t.defVids = [] as UserIdName[];
      }
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          bid: t.bid,
          aid: '',
          tname: t.name,
          langs: t.langs,// this.t.langs, 
          vids: t.defVids
        },
        output => output ? (output.args.changed ? output.args.vids : undefined) : undefined);
    }
    else {
      await this.dialog.error(terms.mustSetBidForThisAction);
    }
  }

}
