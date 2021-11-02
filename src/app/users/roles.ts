import { Injectable } from '@angular/core';
import { AuthenticatedInGuard } from '@remult/angular';



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

@Injectable()
export class OnlyVolunteerGuard extends AuthenticatedInGuard {

    isAllowed() {
        return this.remult.isAllowed(Roles.volunteer) &&
            !this.remult.isAllowed(Roles.manager);
    }
} 