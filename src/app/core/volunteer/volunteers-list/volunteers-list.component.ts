import { Component, OnInit } from '@angular/core';
import { DataControl, DataControlInfo, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { AuthService } from '../../../auth.service';
import { DialogService } from '../../../common/dialog';
import { GridDialogComponent } from '../../../common/grid-dialog/grid-dialog.component';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { NotificationService } from '../../../common/utils';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';
import { Activity } from '../../activity/activity';
import { Branch } from '../../branch/branch';
import { Tenant } from '../../tenant/tenant';

@Component({
  selector: 'app-volunteers-list',
  templateUrl: './volunteers-list.component.html',
  styleUrls: ['./volunteers-list.component.scss']
})
export class VolunteersListComponent implements OnInit {

  @DataControl<VolunteersListComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForVolunteerHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;

  volunteers: GridSettings<Users> = new GridSettings<Users>(
    this.remult.repo(Users),
    {
      where: () => ({ 
        volunteer: true,
        bid: this.remult.branchAllowedForUser(),
        name: this.search ? { $contains: this.search } : undefined
      }),
      newRow: _ => _.volunteer = true,
      allowCrud: false,
      // allowSelection: true,
      numOfColumnsInGrid: 15,
      columnSettings: u => {
        let f = [] as DataControlInfo<Users>[];
        if (this.isBoard()) {
          f.push(u.bid!);
        }
        f.push(
          { field: u.name, caption: terms.name },
          u.langs,
          u.age,
          u.email,
          u.mobile,
          u.birthday,
          u.points,
          u.created,
          u.modified//,
          // u.createdBy
        );
        return f;
      }, //[
      // { field: _.bid, caption: 'סניף' },
      // { field: _.name, caption: 'שם' },
      // _.langs,
      // _.mobile,
      // _.email,
      // _.birthday//,
      // { field: _.defTid, caption: terms.defaultTenant },
      // ],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          textInMenu: terms.showAssignTenants,
          icon: 'groups',
          click: async (u) => await this.showVolunteerTenants(u)
        },
        {
          textInMenu: terms.volunteerDetails,
          icon: 'edit',
          click: async (u) => await this.addVolunteer(u.id)
        },
        {
          textInMenu: terms.sendWelcomeSms,
          icon: 'sms',
          click: async () => await this.sendWelcomeMeesage(
            this.volunteers.currentRow.name,
            this.volunteers.currentRow.mobile)
        },
        // {
        //   //  visible: (v) => { return  this.showActivities(v)},
        //   textInMenu: terms.showActivities,
        //   icon: 'list'
        // },
        // {
        //   //  visible: (v) => { return  this.showActivities(v)},
        //   textInMenu: terms.showAssignTenants,
        //   icon: 'assignment_ind'
        // },
        // {
        //   visible: (_) => !_.isNew() && !this.isDonor(),
        //   textInMenu: terms.transferVolunteer,
        //   icon: 'reply',
        //   click: async (_) => await this.transferVolunteer(_)
        // },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.deleteVolunteer,
          icon: 'delete',//,
          click: async (_) => await this.deleteVolunteer(_)
        }
      ]
    }
  );

  constructor(private remult: Remult, public auth: AuthService, private dialog: DialogService) { }

  ngOnInit(): void {
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove
  }

  isDonor() {
    return this.remult.user.isReadOnly
  }

  async refresh() {
    await this.volunteers.reloadData();
  }

  async transferVolunteer(v: Users) {

  }

  async sendWelcomeMeesage(name: string, mobile: string) {

    let yes = await this.dialog.yesNoQuestion(
      `לשלוח ל${name} (${mobile}) מסרון עם פרטי התחברות לאפליקציה`);
    if (yes) {
      let message = '';
      message += `כניסה לאפליקציה `;
      message += '\n';
      message += 'bit.ly/gh-app ';
      message += '\n';
      message += `תודה ${name}!`;

      // message += `תודה ${name}! `;
      // message += '\n';
      // message += 'bit.ly/eshel-app ';
      // message += '\n';
      // message += `כניסה עם סלולרי שלך`;

      let sent = await NotificationService.SendSms({
        uid: this.remult.user.id,
        mobile: mobile,
        message: message
      });

      if (sent) {
        this.dialog.info(terms.smsSuccefullySent);
      }
      else {
        this.dialog.info(terms.smsFailSent);
      }
    };
  }

  async showVolunteerTenants(user: Users) {
    await openDialog(GridDialogComponent, gd => gd.args = {
      title: `דיירים משוייכים ל${user.name}`,
      settings: new GridSettings(this.remult.repo(Tenant), {
        allowCrud: false,
        where: { defVids: { $contains: user.id } },
        columnSettings: cur => [
          { field: cur.name, width: '90', caption: terms.tenant },
          cur.defVids
        ],
        gridButtons:
          [
            {
              textInMenu: () => terms.refresh,
              icon: 'refresh',
              click: async () => { await this.refresh(); }
            }
          ]
      }),
      ok: () => { }
    })
  }

  async showActivities(user: Users) {
    return true;
  }
  async deleteVolunteer(u: Users) {
    let yes = await this.dialog.confirmDelete(`המתנדב: ${u.name}`);
    if (yes) {
      let count = await this.remult.repo(Activity).count({ vids: { $contains: u.id } });
      if (count > 0) {
        this.dialog.error('לא ניתן למחוק מתנדב עם פעילויות');
      }
      else {
        count = await this.remult.repo(Tenant).count({ defVids: { $contains: u.id } });
        if (count > 0) {
          this.dialog.error('לא ניתן למחוק מתנדב שמשוייך לדייר');
        }
        else {
          await u.delete();
          this.dialog.info('המתנדב נמחק בהצלחה');
          await this.refresh();
        }
      }
    }
  }

  async addVolunteer(vid: string) {
    let isNew = false;
    let title = terms.tenantDetails;
    let u!: Users;
    if (vid && vid.length > 0) {
      u = await this.remult.repo(Users).findId(vid, { useCache: false });
    }
    if (!u) {
      u = this.remult.repo(Users).create();
      u.volunteer = true;
      u.bid = await this.remult.repo(Branch).findId(this.remult.user.branch);
    }
    let branchChanged = false
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        disableClose: u.isNew(),
        title: (u!.isNew() ? terms.addVolunteer : terms.volunteerDetails) + (this.isDonor() ? '(לקריאה בלבד)' : ''),
        fields: () => {
          let f = [];
          if (this.isBoard()) {
            f.push({ field: u!.$.bid, readonly: this.remult.hasValidBranch() })
            if (u!.hasBranch2()) {
              f.push({ field: u!.$.branch2, readonly: u.branch2 ? true : false })
            }
          }
          f.push(
            // { field: u!.$.bid, visible: (r, v) => this.isBoard() },
            // { field: u!.$.branch2, visible: (r, v) => this.isBoard() && u!.hasBranch2() },
            { field: u!.$.name, caption: terms.name },
            u!.$.mobile,
            u!.$.email,
            u!.$.birthday)
          if (this.remult.user.isManagerOrAbove) {
            f.push({ field: u!.$.age, width: '60' })
          }
          f.push(
            u!.$.langs,
            { field: u!.$.points, readonly: true }//,
            // { field: u!.$.defTid, clickIcon: 'search', click: async () => await this.openTenants(u!) }
          )
          return f
        },
        ok: async () => {
          if (!this.isDonor()) {
            branchChanged = (u && u.bid && u.$.bid && u.$.bid.valueChanged())!
            await (u!.isNew() ? u!.create() : u!.save());
          }
        }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      // check to change main-branch
      if (branchChanged) {
        if (!this.remult.hasValidBranch()) {
          await this.auth.swithToBranch(u.bid!.id)
          window?.location?.reload()
        }
      }
      await this.refresh();
    }
  }

  // async openTenants(u: Users) {
  //   await openDialog(SelectTenantComponent, x => x.args = {
  //     bid: u.bid!,
  //     onSelect: t => u.defTid = t,
  //     title: 'דייר',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
  //     tenantLangs: []
  //   });
  // }

}
