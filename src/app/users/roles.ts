import { Injectable } from '@angular/core';
import { AuthenticatedInGuard } from '@remult/angular';



export const Roles = {
    admin: 'admin',
    donor: 'donor',
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
export class DonorGuard extends AuthenticatedInGuard {

    isAllowed() {
        return Roles.donor;
    }
}

@Injectable()
export class OnlyVolunteerGuard extends AuthenticatedInGuard {

    isAllowed() {//this.remult.user.roles.length === 1
        return this.remult.user.isVolunteer
    }
}

@Injectable()
export class ManagerOrAboveGuard extends AuthenticatedInGuard {

    isAllowed() {
        return this.remult.user.isManagerOrAbove
        // .isAllowed(Roles.manager) ||
        //     this.remult.isAllowed(Roles.board)||
        //     this.remult.isAllowed(Roles.donor)||
        //     this.remult.isAllowed(Roles.admin);
    }
} 