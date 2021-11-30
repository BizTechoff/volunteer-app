import { Component, OnInit } from '@angular/core';
import { DataControl } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Branch } from '../../branch/branch';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {


  iframe = document.getElementById('calendar') as HTMLIFrameElement;
  SelectedCalendarFrame = '';
  @DataControl<CalendarComponent>({ valueChange: async (r, v) => await r.refresh() })
  @Field({ caption: terms.branch })
  branch?: Branch = null!;

  constructor(private remult: Remult) { }

  terms = terms;
  get $() { return getFields(this, this.remult) };

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async ngOnInit() {
    
    let b = await this.remult.repo(Branch).findId(this.remult.user.bid);
    if (b) {
      this.branch = b;
    }
    // await this.refresh();
    // var footer1 = document.getElementById("subscribe-id")!;
    // footer1.style.display = "none";//.setProperty('display','none');
  } 

  selectedCalendarFrame(email:string){

    return true;
  }

  async refresh() {
    console.log('from refresh');
    window?.location?.reload();
    // let t = this.branch;
    // this.branch  = null!;
    // this.branch = 
    // if (this.branch) {
    //   // this.selectedCalendarFrame = this.branch.frame;
    //   this.SelectedCalendarFrame = this.branch.email;
    //   window.location.reload();
    //   // if (this.iframe.contentWindow) {
    //   //   this.iframe.innerHTML
    //   //   this.iframe.contentWindow.location.reload();
    //   // }
    // }
  }

}
