import { Component, OnInit } from '@angular/core';
import { DataAreaSettings } from '@remult/angular';
import { Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';

@Component({
  selector: 'app-volunteer-details',
  templateUrl: './volunteer-details.component.html',
  styleUrls: ['./volunteer-details.component.scss']
})
export class VolunteerDetailsComponent implements OnInit {

  volunteer!: Users;
  details = new DataAreaSettings<Users>();
  constructor(private remult: Remult, private dialog: DialogService) { }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.volunteer = await this.remult.repo(Users).findId(this.remult.user.id);
    this.details = new DataAreaSettings(
      {
        fields: () => [
          this.volunteer.$.name,
          this.volunteer.$.mobile,
          this.volunteer.$.email,
          this.volunteer.$.langs,
          this.volunteer.$.birthday
        ],
      });
  }

  async update() {
    await this.volunteer.save();
    this.dialog.info(terms.yoursDetailsSuccesfulySaved);
  }
}
