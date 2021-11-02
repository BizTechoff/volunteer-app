import { Component, OnInit } from '@angular/core';
import { Remult } from 'remult';
import { terms } from '../terms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  terms = terms;
  constructor(public remult: Remult) { }

  ngOnInit() {
  }
}

