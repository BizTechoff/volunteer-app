import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService } from '@remult/angular';
import { Remult } from 'remult';
import { Langs, Users } from '../../users/users';

@Component({
  selector: 'app-select-volunteers',
  templateUrl: './select-volunteers.component.html',
  styleUrls: ['./select-volunteers.component.scss']
})
export class SelectVolunteersComponent implements OnInit {
  searchString = '';
  langs = [] as Langs[];
  options = Langs.getOptions();
  args!: {
    title?: string,
    // usersLangs: Langs[],
    onSelect: (u: Users) => void;
  } 
  constructor(private remult: Remult, private busy: BusyService, private dialogRef: MatDialogRef<any>) { }
  volunteers: Users[] = [];
  ngOnInit() {
    // this.langs = this.args.usersLangs;
    this.loadUserss();
  }
  async loadUserss() {
    this.volunteers = await this.remult.repo(Users).find({
      where: {
        // if there is a search value, search by it
        volunteer: true,
        // .and(t.langs.isIn([this.langs]))
        active: true,
        name: this.searchString ? { $contains: this.searchString } : undefined
      }
    });
  }
  async doSearch() {
    await this.busy.donotWait(async () => this.loadUserss());
  }

  select(p: Users) {
    this.args.onSelect(p);
    this.dialogRef.close();
  }
  selectFirst() {
    if (this.volunteers.length > 0)
      this.select(this.volunteers[0]);
  }
  create() {
    // let Users = this.remult.repo(Users).create({
    //   name: this.searchString,
    //   type: this.filterUsers
    // });
    // openDialog(EditUsersComponent, x => x.args = {
    //   Users,
    //   ok: () => {
    //     this.select(Users);
    //   }
    // });
  }

}
