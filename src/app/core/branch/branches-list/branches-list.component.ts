import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Branch } from '../branch';

@Component({
  selector: 'app-branches-list',
  templateUrl: './branches-list.component.html',
  styleUrls: ['./branches-list.component.scss']
})
export class BranchesListComponent implements OnInit {

  branches = new GridSettings(this.remult.repo(Branch),
    {
      allowCrud: this.remult.isAllowed(Roles.admin),
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

  async refresh() {
    await this.branches.reloadData();
  }

}
