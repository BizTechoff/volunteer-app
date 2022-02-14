import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaFieldsSetting, DataAreaSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
import { AuthService } from '../../../auth.service';
import { DialogService } from '../../../common/dialog';
import { SelectPurposesComponent } from '../../../common/select-purposes/select-purposes.component';
import { SelectTenantComponent } from '../../../common/select-tenant/select-tenant.component';
import { UserIdName } from '../../../common/types';
import { NotificationService } from '../../../common/utils';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { Photo } from '../../photo/photo';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';
import { Tenant } from '../../tenant/tenant';
import { VolunteersAssignmentComponent } from '../../volunteer/volunteers-assignment/volunteers-assignment.component';
import { Activity, ActivityStatus } from '../activity';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss'],
  animations: [
    trigger("shakeit", [
      transition("void => *", [
        animate('770ms 3500ms ease-in', keyframes([
          style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
          style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.3 }),
          style({ transform: 'translate3d(17px, 0, 0)', offset: 0.4 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.5 }),
          style({ transform: 'translate3d(17px, 0, 0)', offset: 0.6 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.7 }),
          style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
          style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
        ])
        )
      ])//,
      // transition("* => void", [
      //   animate('500ms ease-out', style({ transform: 'translateX(300%) scale(0) rotate(360deg)' }))
      // ])
    ])
    /*
    trigger('shakeit', [
      state('shakestart', style({
        transform: 'scale(1)',
      })),
      state('shakeend', style({
        transform: 'scale(1)',
      })),
      transition('shakestart => shakeend', animate('1000ms ease-in', keyframes([
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.3 }),
        style({ transform: 'translate3d(4px, 0, 0)', offset: 0.4 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.5 }),
        style({ transform: 'translate3d(4px, 0, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.7 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
      ]))),
    ])
    */
  ]
})
export class ActivityDetailsComponent implements OnInit {

  args: {
    branch?: Branch,
    aid?: string,
    volunteer?: Users,
    tid?: Tenant,
    readonly?: boolean,
    changed?: boolean,
    autoOpenPuposes?: boolean
  } = { branch: undefined, aid: '', volunteer: undefined, tid: undefined, readonly: false, changed: false, autoOpenPuposes: false };
  today = new Date();
  activity!: Activity;
  branchChanged = false;
  top = new DataAreaSettings({});
  fields = new DataAreaSettings({});
  images: Photo[] = [];
  terms = terms;
  lastVids = [] as UserIdName[];
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, public auth: AuthService, private dialog: DialogService, private win: MatDialogRef<any>) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { aid: '', volunteer: undefined, tid: undefined, readonly: false, changed: false, autoOpenPuposes: false };
    }
    if (!this.args.tid) {
      this.args.tid = undefined;
    }
    if (!this.args.aid) {
      this.args.aid = '';
    }
    if (!this.args.autoOpenPuposes) {
      this.args.autoOpenPuposes = false;
    }
    this.args.changed = false;
    await this.retrieve();

    if (this.isShowDeliveredFoodToShabat() && this.didntCheckedFoodDelivery()) {

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      wait(100)
        .then(async () => this.dialog.info(terms.reminder4FoodDelivery, 2300))
        .catch(err => console.debug(err));

      wait(3500)
        .then(async () => this.applyNotifications())
        .catch(err => console.debug(err));
    }

    if (this.args.autoOpenPuposes) {
      await openDialog(SelectPurposesComponent, x => x.args = {
        // onSelect: site => f.value = site,
        // title: f.metadata.caption,
        purposes: this.activity.purposes
      })
    }
  }

  didntCheckedFoodDelivery() {
    let result = false;
    if (this.remult.user.isVolunteer && this.activity && !this.activity.foodDelivered!) {
      result = true;
    }
    return result;
  }

  applyNotifications() {

    try {
      this.beep();
      navigator.vibrate(200);
    }
    catch (err) {
      console.debug('applyNotifications.error', err);
    }
  }

  beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
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
    if (!this.activity || this.activity.isNew()) {
      return true
    }
    if (this.activity.status.isClosed()) {
      return false
    }
    if (this.remult.user.isVolunteer) {
      return true;
    }
    return false;
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove
  }

  isDonor() {
    return this.remult.user.isReadOnly;
  }

  isManager() {
    return this.remult.user.isManagerOrAbove;
  }

  isOnlyVolunteer() {
    return this.remult.isAllowed(Roles.volunteer) && this.remult.user.roles.length == 1;
  }

  isShowDeliveredFoodToShabat() {
    return this.activity &&
      !this.activity.isNew() &&
      this.activity.date &&
      // ActivityStatus.inProgressStatuses().includes( this.activity.status) &&
      [3, 4].includes(this.activity.date.getDay());//יום רביעי וחמישי
  }

  async retrieve() {
    let validId = this.args.aid && this.args.aid.length > 0;
    if (validId) {
      let found = await this.remult.repo(Activity).findId(this.args.aid!, { useCache: false });
      if (found) {
        this.activity = found;
        this.lastVids.push(...this.activity.vids);
      }
    }
    if (!this.activity) {
      let branch = undefined;
      if (this.isBoard()) {
        if (this.args.branch) {
          branch = this.args.branch;
        }
      }
      else {
        branch = await this.remult.repo(Branch).findId(this.remult.user.branch);
      }
      let hour = this.today.getHours();
      let min = this.today.getMinutes();

      this.activity = this.remult.repo(Activity).create({
        bid: branch,
        vids: this.args.volunteer ? [{ id: this.args.volunteer.id, name: this.args.volunteer.name }] : [],
        tid: this.args.tid,//await this.remult.repo(Tenant).findId(this.args.tid!),
        // purposeDesc: terms.defaultPurposeDesc6,
        date: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()),
        fh: ((hour + 1) % 24).toString().padStart(2, '0') + ':' + '00',
        th: ((hour + 3) % 24).toString().padStart(2, '0') + ':' + '00'
      });

      if (!this.activity.vids) {
        this.activity.vids = [] as UserIdName[];
      }
      this.addCurrentUserToVids();

    }
    this.top = new DataAreaSettings({
      fields: () => {
        let f: DataAreaFieldsSetting<Activity>[] = [];
        // if(this.isShowDeliveredFoodToShabat()){
        //   f.push(this.activity.$.foodDelivered);
        // }
        if (this.isBoard()) {
          f.push({ field: this.activity.$.bid, readonly: this.remult.hasValidBranch() || this.activity.status.isClosed() });
        }
        if (this.isManager()) {
          f.push({ field: this.activity.$.status, readonly: this.activity.status.isClosed(), visible: (r, v) => this.remult.user.isAdmin });
        }
        return f;
      }
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        {
          field: this.activity.$.tid,
          readonly: this.activity.status.isClosed(),
          clickIcon: 'search',
          click: async () => await this.openTenants()
        },//, readonly: true },
        {
          field: this.activity.$.vids,
          hideDataOnInput: true,
          getValue: (x, col) => col.displayValue,
          readonly: () => this.activity.tid && this.activity.tid.id && this.activity.tid.id.length > 0 ? this.activity.status.isClosed() : true,
          clickIcon: 'search',
          click: async () => await this.openAssignment()
        },//, displayValue: () => {return this.activity.$.vids && this.activity.$.vids.value ? this.activity.$.vids.value.map(i => i.name).join(', ').trim() : '';} },
        // { field: this.activity.$.volids, clickIcon: 'search', click: async () => await this.openAssignment() },
        { field: this.activity.$.date, readonly: this.activity.status.isClosed() },
        [{ field: this.activity.$.fh, readonly: this.activity.status.isClosed() },
        { field: this.activity.$.th, readonly: this.activity.status.isClosed() }],
        { field: this.activity.$.purposes, readonly: this.activity.status.isClosed() },
        { field: this.activity.$.purposeDesc, readonly: this.activity.status.isClosed() },
        { field: this.activity.$.remark, readonly: this.activity.status.isClosed() }
      ]
    });
  }

  async openTenants() {
    let bidOk = (this.activity.bid && this.activity.bid.id && this.activity.bid.id.length > 0)!;
    if (bidOk) {
      await openDialog(SelectTenantComponent, x => x.args = {
        ignoreDefVids: true,
        bid: this.activity.bid,
        onSelect: t => {
          if (!this.activity.tid || this.activity.tid.id !== t.id) {
            this.activity.tid = t;
            this.activity.vids.splice(0);
            this.addCurrentUserToVids();
          }
        },
        title: 'דייר'// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
        // tenantLangs: []
      });
    }
    else {
      await this.dialog.error(terms.mustSetBidForSetTenant);
    }
  }

  async openAssignment() {

    let bidOk = (this.activity.bid && this.activity.bid.id && this.activity.bid.id.length > 0)!;
    if (bidOk) {
      let explicit = [] as UserIdName[];
      for (const v of this.activity.tid.defVids) {
        explicit.push({ id: v.id, name: v.name });
      }
      let selected = [] as UserIdName[];
      for (const v of this.activity.vids) {
        selected.push({ id: v.id, name: v.name });
      }
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          allowChange: !this.isManager(),
          branch: this.activity.bid,
          explicit: explicit,
          title: this.activity.tid.name,
          langs: this.activity.tid?.langs,// this.t.langs, 
          selected: selected.map(s => s),//clone
          organizer: this.activity.isNew() ? this.remult.user.id : this.activity.createdBy?.id
        },
        output => output && output.args && output.args.changed ? output.args.selected : undefined);
      if (volids) {
        this.activity.vids.splice(0);
        this.activity.vids.push(...volids);
      }

      this.addCurrentUserToVids();
      if (this.activity.vids.length > 0) {
        if (this.activity.status === ActivityStatus.w4_assign) {
          this.activity.status = ActivityStatus.w4_start;
        }
      }
    }
    else {
      await this.dialog.error(terms.mustSetBidForSetVolunteers);
    }
  }

  async openPhotosAlbum() {
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: this.activity.bid, aid: this.activity.id },//, tid: '' },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

  addCurrentUserToVids() {
    let found = false;
    if (this.remult.user.isVolunteer || this.args.volunteer) {
      let id = this.args.volunteer ? this.args.volunteer.id : this.remult.user.id
      let name = this.args.volunteer ? this.args.volunteer.name : this.remult.user.name

      this.activity.vids.forEach(v => {
        if (v.id === id) {
          found = true;
        }
      });
      if (!found) {
        this.activity.vids.push({ id: id, name: name });
      }
    }
  }

  async saveAndClose() {
    if (!this.activity.bid) {
      return this.dialog.info(terms.mustEnterBranch)
    }
    if (!this.activity.tid) {
      return this.dialog.info(terms.mustEnterTenant)
    }
    this.branchChanged = this.activity && this.activity.bid && this.activity.$.bid && this.activity.$.bid.valueChanged()
    let alreadySaved = false;
    if (this.activity.vids.length > 0) {
      if (this.activity.status === ActivityStatus.w4_assign) {
        alreadySaved = await this.activity.status.onChanging(this.activity, ActivityStatus.w4_start, this.remult.user.id);
      }
    }
    else {
      alreadySaved = await this.activity.status.onChanging(this.activity, ActivityStatus.w4_assign, this.remult.user.id);
      // console.log(2)
    }
    if (!alreadySaved) {
      await this.activity.save();
    }
    this.args.changed = true;
    this.args.aid = this.activity.id;
    let success = await NotificationService.SendCalendar(this.activity.id);
    this.close();
  }

  // SEND EMAIL TO VOLUNTEERS + INVITETION.ics
  async close() {

    // check to change main-branch
    if (this.branchChanged) {
      if (!this.remult.hasValidBranch()) {
        await this.auth.swithToBranch(this.activity.bid.id)
        window?.location?.reload()
      }
    }

    this.win.close();
  }

  async CheckConflictsVolenteersOrTenant() {
    return false;
  }

  async addPhoto() {

  }

  async removeImage(img: Photo) {
    let yes = await this.dialog.confirmDelete(terms.delete)!;
    if (yes) {
      await img.delete();
      var index = this.images.indexOf(img);
      if (index >= 0) {
        this.images.splice(index, 1);
        this.dialog.info('התמונה הוסרה בהצלחה');
      }
    }
  }
}
