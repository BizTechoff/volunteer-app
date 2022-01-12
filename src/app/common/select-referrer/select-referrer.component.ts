import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Field, getFields, Remult, ValueListFieldType } from 'remult';
import { ValueListValueConverter } from 'remult/valueConverters';
import { terms } from '../../terms';


@ValueListFieldType({ /*displayValue: () => {return '';}*/ /*multi: true*/ })
export class Referrer {
    static welfare = new Referrer(1, 'רווחה');
    static municipality = new Referrer(2, 'עירייה');
    static tenant = new Referrer(3, 'דייר אחר');
    static neighbor = new Referrer(4, 'שכנה');
    constructor(public id: number, public caption: string) { }

    static getOptions() {
        let op = new ValueListValueConverter(Referrer).getOptions();
        return op;
    }

}

@Component({
  selector: 'app-select-referrer',
  templateUrl: './select-referrer.component.html',
  styleUrls: ['./select-referrer.component.scss']
})
export class SelectReferrerComponent implements OnInit {

  args: {
    referrer: Referrer
  } = { referrer: Referrer.welfare };
  allReferrers: { r: Referrer, c: boolean }[] = [];
  constructor(private remult: Remult, private win: MatDialogRef<any>) { }
 
  terms = terms;
  get $() { return getFields(this, this.remult) };

  @Field({caption: terms.referrer})
  referrer: Referrer = Referrer.welfare;
 
  ngOnInit(): void {
    this.referrer = this.args.referrer;
    Referrer.getOptions().forEach(rfr => {
      this.allReferrers.push({ r: rfr, c: this.args.referrer === rfr });
    });
  }

  close() {
    this.win.close();
  }

  // isChecked(l: Langs) {
  //   return this.args.langs?.find(_ => _.id === l.id) ? true : false;
  // }

  // langSelected(l: Langs) {
  //   console.log('langSelected');
  // }

}
