import { Component, OnInit } from '@angular/core';
import { DataControl, DataControlInfo, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { AuthService } from '../../../auth.service';
import { DialogService } from '../../../common/dialog';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { UserIdName } from '../../../common/types';
import { terms } from '../../../terms';
import { Activity } from '../../activity/activity';
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

  // @DataControl<TenantsListComponent>({ valueChange: async (r) => await r.refresh() })
  @DataControl<TenantsListComponent>({
    valueChange: async (r) => await r.refresh()
    // {
    //   if (!r.refreshing) {
    //     if (r.timer) {
    //       clearTimeout(r.timer);
    //     }
    //     r.timer = setTimeout(() => r.subject.next(), 300);
    //   }
    // }
  })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''
  // timer: NodeJS.Timeout = undefined!;
  // subject = new Subject();
  // refreshing = false;

  get $() { return getFields(this, this.remult) };
  terms = terms;
  tenants: GridSettings<Tenant> = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: () => ({
        bid: this.remult.branchAllowedForUser(),
        name: this.search ? { $contains: this.search } : undefined
      }),
      allowCrud: false,
      numOfColumnsInGrid: 15,
      columnSettings: t => {

        let f = [] as DataControlInfo<Tenant>[];
        if (this.isBoard()) {
          f.push(t.bid!);
        }
        f.push(
          t.name,
          t.defVids,
          t.langs,
          t.age,
          t.address,
          t.mobile,
          t.referrer,
          // t.referrerRemark,
          t.birthday,
          t.created,
          t.modified//,
          // t.createdBy
          // t.email
        );
        return f;
      }
      // [
      //   { field: t.bid, visible: (r, v) => this.isBoard() },
      //   t.referrer,
      //   t.name,
      //   t.defVids,
      //   t.langs,
      //   t.address,
      //   t.mobile,
      //   t.birthday]
      ,
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
          icon: 'groups',
          click: async (_) => await this.assignVolunteers(_, true)
        },
        {
          visible: (_) => !_.isNew() && this.isAllowEdit(),
          textInMenu: terms.addActivity,
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.tenantDetails,
          icon: 'edit',
          click: async (_) => await this.addTenant(_.id)
        },
        // {
        //   visible: (_) => !_.isNew(),
        //   textInMenu: terms.showActivities,
        //   icon: 'list',
        //   click: async (_) => await this.showActivities(_)
        // },
        // {
        //   visible: (_) => !_.isNew() && !this.isDonor(),
        //   textInMenu: terms.transferTenant,
        //   icon: 'reply',
        //   click: async (_) => await this.transferTenant(_)
        // },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.deleteTenant,
          icon: 'delete',//,
          click: async (_) => await this.deleteTenant(_)
        }
      ]
    }
  );
  

  constructor(private remult: Remult, public auth: AuthService, private dialog: DialogService) {
    // this.subject.subscribe(async () => {
    //   await this.refresh();
    // });
  }

  ngOnInit(): void {
  }

  isAllowEdit() {
    if (this.remult.user.isAdmin) {
      return true
    }
    if (this.remult.user.isReadOnly) {
      return false
    }
    if (this.remult.user.isBoardOrAbove) {
      return false
    }
    if (this.remult.user.isVolunteer) {
      return false;
    }
    return true;
  }

  async refresh() {
    // this.refreshing = true;
    await this.tenants.reloadData();
    // this.refreshing = false;
  }

  async assignVolunteers(t: Tenant, autoSave = false) {
    let bidOk = (t && t.bid && t.bid.id && t.bid.id.length > 0)!;
    if (bidOk) {
      // t.defVids.splice(0);
      // let u = await this.remult.repo(Users).findFirst({ useCache: false });
      // t.defVids.push(u);
      if (!t.defVids) {
        t.defVids = [] as UserIdName[];
      }

      let selected = [] as UserIdName[];
      for (const v of t.defVids) {
        selected.push({ id: v.id, name: v.name });
      }
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          allowChange: true,
          branch: t.bid,
          explicit: undefined!,
          title: t.name,
          langs: t.langs,// this.t.langs, 
          selected: t.defVids.map(s => s),//clone
          organizer: ''
        },
        output => output && output.args && output.args.changed ? output.args.selected : undefined);
      if (volids) {
        t.defVids.splice(0);
        t.defVids.push(...volids);
        if (autoSave) {
          await t.save();
          await this.refresh();
        }
      }
    }
    else {
      await this.dialog.error(terms.mustSetBidForSetVolunteers);
    }
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
      _ => _.args = { branch: tnt.bid, tid: tnt },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // let yes 
      await this.refresh();
    }
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove
  }

  isDonor() {
    return this.remult.user.isReadOnly;
  }

  async deleteTenant(t: Tenant) {
    let yes = await this.dialog.confirmDelete(terms.tenant);
    if (yes) {
      let count = await this.remult.repo(Activity).count({ tid: t });
      if (count > 0) {
        this.dialog.error('לא ניתן למחוק דייר עם פעילויות');
      }
      else {
        await t.delete();
        this.dialog.info('הדייר נמחק בהצלחה');
        await this.refresh();
      }
    }
  }

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
      // if (!this.isBoard()) {
      t.bid = await this.remult.repo(Branch).findId(this.remult.user.branch);
      // }
    }
    // console.log(t);
    let branchChanged = false
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        disableClose: t.isNew(),
        title: title + (this.isDonor() ? '(לקריאה בלבד)' : ''),
        fields: () => {
          let f = [];
          if (this.isBoard()) {
            f.push({ field: t.$.bid, readonly: this.remult.hasValidBranch() });//readonly: t.bid ? true : false
          }
          f.push(
            [{ field: t.$.referrer, width: '88' }, t.$.referrerRemark],
            t.$.name,
            [t.$.mobile, t.$.phone],
            [t.$.address, { field: t.$.apartment, width: '50' }, { field: t.$.floor, width: '50' }],
            t.$.addressRemark,
            [t.$.birthday,
            t.$.age],
            t.$.langs,
            { field: t!.$.defVids, click: async () => await this.assignVolunteers(t!) }
          );
          return f;
        }
        // [
        //   { field: t!.$.bid, visible: (r, v) => this.isBoard() },
        //   t!.$.referrer,
        //   t!.$.name,
        //   t!.$.mobile,
        //   t!.$.address,
        //   [
        //     { field: t!.$.birthday },
        //     { field: t!.$.age, width: '60', readonly: true }
        //   ],
        //   t!.$.langs,
        //   { field: t!.$.defVids, click: async () => await this.openVolunteers(t!) }]
        ,
        // validate: async () => {
        //   return await this.canSaveAndClose(t);
        // },
        ok: async () => {
          if (!this.isDonor()) {
            branchChanged = t && t.bid && t.$.bid && t.$.bid.valueChanged()
            await t!.save();
            if (!(t.defVids && t.defVids.length > 0)!) {
              this.dialog.info(terms.notVolunteersForCurrentTenant);
            }
          }
        }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      // check to change main-branch
      // console.log(1,'t.$.bid.valueChanged()','current',t.bid.id,t.$.bid.valueChanged(),'originalValue',t.$.bid.originalValue)
      if (branchChanged) {
        if (!this.remult.hasValidBranch()) {
          await this.auth.swithToBranch(t.bid.id)
          window?.location?.reload()
        }
      }
      // console.log(4)
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
      result = await this.dialog.info(terms.notVolunteersForCurrentTenant);
    }
    return result;
  }

}
