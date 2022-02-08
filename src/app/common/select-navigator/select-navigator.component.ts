import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Navigators } from '../../core/volunteer/volunteer-activities/volunteer-activities.component';
import { terms } from '../../terms';

@Component({
  selector: 'app-select-navigator',
  templateUrl: './select-navigator.component.html',
  styleUrls: ['./select-navigator.component.scss']
})
export class SelectNavigatorComponent implements OnInit {

  args: {
    selected?: Navigators,
    address?:string
  } = { selected: undefined, address: '' };
  all: Navigators[] = [] as Navigators[];
  constructor(private win: MatDialogRef<any>) { }
  terms = terms;

  ngOnInit(): void {
    Navigators.getOptions().forEach(nav => {
      this.all.push(nav)
    });
  }

  close(n: Navigators) {
    this.args.selected = n
    this.win.close();
  }
}
