import { Component, OnInit } from '@angular/core';
import { Remult } from 'remult';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public remult: Remult) { }

  ngOnInit() {
  }
}

