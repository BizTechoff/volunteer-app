import { Component, OnInit } from '@angular/core';
import { Remult } from 'remult';
import { Photo } from '../../core/photo/photo';

@Component({
  selector: 'app-offline-read',
  templateUrl: './offline-read.component.html',
  styleUrls: ['./offline-read.component.scss']
})
export class OfflineReadComponent implements OnInit {

  constructor(private remult:Remult) { }

  async ngOnInit() {
  }

  async getPhoto(){
    await this.remult.repo(Photo).findFirst();
  }

}
