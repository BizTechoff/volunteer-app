import { Component, OnInit } from '@angular/core';
import { DataControlInfo, GridSettings } from '@remult/angular';
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
      columnSettings: row => {
        let f = [] as DataControlInfo<Branch>[];
        f.push(row.name, row.address)
        if (this.isAdmin()) {
          f.push(row.email, row.color, row.frame);
        }
        return f;
      },
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

  isAdmin() {
    return this.remult.isAllowed(Roles.admin);
  }

  ngOnInit(): void {
  }

  async refresh() {
    await this.branches.reloadData();
  }

}
