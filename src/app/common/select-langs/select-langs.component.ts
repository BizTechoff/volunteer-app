import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Langs } from '../../users/users';

@Component({
  selector: 'app-select-langs',
  templateUrl: './select-langs.component.html',
  styleUrls: ['./select-langs.component.scss']
})
export class SelectLangsComponent implements OnInit {

  args: {
    langs?: Langs[]
  } = { langs: [] };
  allLangs: { l: Langs, c: boolean }[] = [];
  constructor(private win:MatDialogRef<any>) { }

  ngOnInit(): void {
    Langs.getOptions().forEach(lng => {
      this.allLangs.push({l:lng, c: this.args.langs?.find(_ => _.id === lng.id) ? true : false})
    });
  }

  close(){
    this.args.langs?.splice(0);
    this.allLangs.forEach(l => {
      if(l.c){
        this.args.langs?.push(l.l);
      }
    });
    this.win.close();
  }

  // isChecked(l: Langs) {
  //   return this.args.langs?.find(_ => _.id === l.id) ? true : false;
  // }

  // langSelected(l: Langs) {
  //   console.log('langSelected');
  // }

}
