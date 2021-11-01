import { AuthenticatedInGuard } from '@remult/angular';
import { Injectable } from '@angular/core';



export const Roles = { 
    admin: 'admin',
    board: 'board',
    manager: 'manager',
    volunteer: 'volunteer'
}


@Injectable()
export class AdminGuard extends AuthenticatedInGuard {

    isAllowed() {
        return Roles.admin;
    }
}

@Injectable()
export class BoardGuard extends AuthenticatedInGuard {

    isAllowed() {
        return Roles.board;
    }
}

@Injectable()
export class ManagerGuard extends AuthenticatedInGuard {

    isAllowed() {
        return Roles.manager;
    }
}

@Injectable()
export class VolunteerGuard extends AuthenticatedInGuard {

    isAllowed() {
        return Roles.volunteer;
    }
}