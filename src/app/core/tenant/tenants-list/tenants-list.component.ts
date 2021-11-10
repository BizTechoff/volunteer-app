import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { FILTER_IGNORE } from '../../../common/globals';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
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
      where: _ => (this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid))
        .and(this.search ? _.name.contains(this.search) : FILTER_IGNORE),
      allowCrud: false,
      numOfColumnsInGrid: 10,
      columnSettings: t => [
        t.referrer,
        { field: t.bid, visible: (r, v) => this.isBoard() },
        t.name,
        t.mobile,
        t.address,
        t.birthday,
        t.langs,
        t.defVids],
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
          textInMenu: terms.addActivity,
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.tenantDetails,
          icon: 'edit',
          click: async (_) => await this.addTenant(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.showActivities,
          icon: 'list',
          click: async (_) => await this.showActivities(_)
        },
        {
          visible: (_) => !_.isNew(),
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


  @Field({ caption: terms.age })
  age: number = 0;

  async addTenant(t?: Tenant) {
    let isNew = false;
    if (!t) {
      t = this.remult.repo(Tenant).create();
      isNew = true;
      t.bid = this.isBoard() ? '' : this.remult.user.bid;
    }
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addTenant,
        fields: () => [
          t!.$.referrer,
          { field: t!.$.bid, visible: (r, v) => this.isBoard() },
          t!.$.name,
          t!.$.mobile,
          t!.$.address,
          [
            { field: t!.$.birthday, valueChange: (r, v) => { this.age = t!.calcAge(); } } ,
            { field:  this.$.age, width: '60', readonly: true}
          ], 
          t!.$.langs,
          { field: t!.$.defVids, clickIcon: 'search', click: async () => await this.openVolunteers(t!) }],
        ok: async () => { await t!.save(); }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
      if (isNew) {
        if (await this.dialog.yesNoQuestion(terms.shouldAddActivity.replace('!t.name!', t.name))) {
          this.openActivity(t);
        }
      }
    }
  }

  async openVolunteers(t: Tenant) {
    let bidOk = (t && t.bid && t.bid.length > 0 && t.bid !== '0')!;
    if (bidOk) {
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          bid: t.bid,
          aid: '',
          tname: t.name,
          langs: t.langs,// this.t.langs, 
          vids: t.defVids,
          volids: []
        },
        output => output ? (output.args.changed ? output.args.volids : undefined) : undefined);

      if (volids) {
        t.defVids.splice(0);
      }
    }
    else {
      await this.dialog.error(terms.mustSetBidForThisAction);
    }
  }

}
