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
  haifa = 'https://calendar.google.com/calendar/embed?src=eshel.app.haifa%40gmail.com&ctz=Asia%2FJerusalem';
  branchCalendarsIds:{id:string, src:string}[] = [
    {id:'eshel.app.haifa@gmail.com',src:'https://calendar.google.com/calendar/embed?src=eshel.app.haifa%40gmail.com&ctz=Asia%2FJerusalem'},
    {id:'eshel.app.hulon@gmail.com',src:'https://calendar.google.com/calendar/embed?src=eshel.app.haifa%40gmail.com&ctz=Asia%2FJerusalem'}
  ];
  selectedCalendarId = 'eshel.app.haifa@gmail.com';
  @DataControl<CalendarComponent>({ valueChange: async (r, v) => 
    console.log(11111) })
  @Field({ caption: terms.branch }) 
  branch?: Branch = undefined;
  
  constructor(private remult: Remult) { }
  
  terms = terms;
  get $() { return getFields(this, this.remult) };

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  ngOnInit(): void {
    // var footer1 = document.getElementById("subscribe-id")!;
    // footer1.style.display = "none";//.setProperty('display','none');
  }

  async refresh(){
    if(this.branch){
      this.selectedCalendarId = this.branch.id;
      console.log(this.selectedCalendarId);
    }
    // this.iframe.src = this.iframe.src;
  }

}
