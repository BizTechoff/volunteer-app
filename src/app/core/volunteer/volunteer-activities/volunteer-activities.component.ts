import { Component, OnInit } from '@angular/core';
import { Activity } from '../../activity/activity';

@Component({
  selector: 'app-volunteer-activities',
  templateUrl: './volunteer-activities.component.html',
  styleUrls: ['./volunteer-activities.component.scss']
})
export class VolunteerActivitiesComponent implements OnInit {

  activities = [] as Activity[];
  constructor() { }

  ngOnInit(): void {
  }

}
