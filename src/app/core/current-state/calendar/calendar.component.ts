import { Component, OnInit } from '@angular/core';
import { getFields, Remult } from 'remult';
import { terms } from '../../../terms';
import { Branch } from '../../branch/branch';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {


  iframe = document.getElementById('calendar') as HTMLIFrameElement;
  selectedCalendarFrame = '';

  constructor(public remult: Remult) { }

  terms = terms;
  get $() { return getFields(this, this.remult) };

  isBoard() {
    return this.remult.user.isBoardOrAbove
  }

  async ngOnInit() {

    let b = await this.remult.repo(Branch).findId(this.remult.user.bid);
    if (b) {
      this.selectedCalendarFrame = b.frame && b.frame.length > 0 ? b.frame : ''
    }
    else { 
      if (this.remult.user.isBoardOrAbove) {
        this.selectedCalendarFrame =
          `https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=Asia%2FJerusalem&title=%D7%90%D7%A9%D7%9C%20%D7%94%D7%A0%D7%94%D7%9C%D7%94&showCalendars=0&showTz=0&src=ZXNoZWwuYm9hcmRAZ21haWwuY29t&src=ZXNoZWwuYXBwLmhhaWZhQGdtYWlsLmNvbQ&src=ZXNoZWwuYXBwLmh1bG9uQGdtYWlsLmNvbQ&src=ZXNoZWwuYXBwLmtpcnlhdC5vbm9AZ21haWwuY29t&src=ZXNoZWwuYXBwLm5lc3MudHppeW9uYUBnbWFpbC5jb20&src=aXcuanVkYWlzbSNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039BE5&color=%23EF6C00&color=%23B39DDB&color=%23E67C73&color=%239E69AF&color=%234285F4' | safe: 'resourceUrl'" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>`
      }
    }
    // if (b) {
    //   this.branch = b;
    // }
    // await this.refresh();
    // var footer1 = document.getElementById("subscribe-id")!;
    // footer1.style.display = "none";//.setProperty('display','none');
  }

  // selectedCalendarFrame(email: string) {

  //   return true;
  // }

  async refresh() {
    window?.location?.reload();
  }

  // async refresh() {
  //   // console.log('CalendarComponent.refresh')
  //   // console.log('from refresh');
  //   window?.location?.reload();
  //   // let t = this.branch;
  //   // this.branch  = null!;
  //   // this.branch = 
  //   // if (this.branch) {
  //   //   // this.selectedCalendarFrame = this.branch.frame;
  //   //   this.SelectedCalendarFrame = this.branch.email;
  //   //   window.location.reload();
  //   //   // if (this.iframe.contentWindow) {
  //   //   //   this.iframe.innerHTML
  //   //   //   this.iframe.contentWindow.location.reload();
  //   //   // }
  //   // }
  // }

}
