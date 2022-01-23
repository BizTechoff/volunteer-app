import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { terms } from '../../terms';

@Component({
  selector: 'app-select-call',
  templateUrl: './select-call.component.html',
  styleUrls: ['./select-call.component.scss']
})
export class SelectCallComponent implements OnInit {

  args: {
    options: string[]
    selected?: string
  } = { options: [] as string[], selected: '' }
  constructor(private win: MatDialogRef<any>) { }
  terms = terms;

  ngOnInit(): void {
  }

  close(number: string) {
    this.args.selected = number
    this.win.close();
  }

}
