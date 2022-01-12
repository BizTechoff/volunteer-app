import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { openDialog } from '@remult/angular';
import * as jwt from 'jsonwebtoken';
import { BackendMethod, Remult, UserInfo } from 'remult';
import { useVolunteerLoginWithVerificationCode } from './common/globals';
import { augmentRemult, terms } from './terms';
import { Roles } from './users/roles';
import { UserVerificationComponent } from './users/user-verification/user-verification.component';
import { Users } from './users/users';

const AUTH_TOKEN_KEY = "authToken";
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    forgotPassword = false;
    isFirstLogin = true;//welcome message
    isConnected = false;
    constructor(private remult: Remult) {
        augmentRemult(remult);
        // (<MotiUserInfo>remult.user).snif
        let token = AuthService.fromStorage();
        if (token) {
            this.isFirstLogin = false;
            this.setAuthToken(token);
        }
    }

    async signIn(username: string, password: string) {
        this.isConnected = false;
        let ui: UserInfo = await AuthService.signIn(username, password);
        if (useVolunteerLoginWithVerificationCode) {
            if (ui.roles.length === 1 && ui.roles.includes(Roles.volunteer)) {
                let mobile = await AuthService.getUserMobile(ui.id);
                // apply sms-mobile verification.
                let verified = await openDialog(UserVerificationComponent,
                    _ => _.args = { in: { uid: ui.id, mobile: mobile } },
                    _ => _ && _.args.out ? _.args.out.verified : false);
                if (!verified!) {
                    return false;
                }
            }
        }
        this.setAuthToken(await AuthService.setToken(ui));
        return true;
    }

    @BackendMethod({ allowed: true })
    static async setToken(ui: UserInfo) {
        return jwt.sign(ui, getJwtTokenSignKey());
    }

    @BackendMethod({ allowed: true })
    static async getUserMobile(uid: string, remult?: Remult) {
        let result = '';
        let u = await remult!.repo(Users).findId(uid);
        if (u?.mobile) {
            result = u.mobile;
        }
        return result;
    }

    @BackendMethod({ allowed: true })
    static async signIn(user: string, password: string, remult?: Remult) {
        //which user is here? probably kind of a system user
        
        // let u: Users = null!;
        // console.log('signIn', 1);
        // for await (const a of remult!.repo(Users).query({
        //     // where: { name: user }
        // })) {
        //     console.log('signIn', 2);
        //     if (a.name === user) {
        //         u = a;
        //         break;
        //     }
        // }
        // console.log('signIn', 3);
        // // console.log('signIn', 1);
        // // let us = await remult!.repo(Users).query();
        // // console.log('signIn', 2);
        // // let u = await remult!.repo(Users).query({ where: { name: user } });
        // // console.log('signIn', 3);

        let u = await remult!.repo(Users).findFirst({ name: user });
        if (u) {
            if (await u.passwordMatches(password)) {
                let result: UserInfo = {
                    id: u.id,
                    roles: [], 
                    name: u.name,
                    bid: u.bid?.id ?? '',
                    bname: u.bid?.name ?? '',
                    bid2: u.branch2?.id ?? '',
                    b2name: u.branch2?.name ?? ''
                };
                if (u.admin) {
                    result.roles.push(Roles.admin, Roles.board, Roles.manager, Roles.volunteer);
                }
                else if (u.donor) {
                    result.roles.push(Roles.donor, Roles.board, Roles.manager, Roles.volunteer);
                }
                else if (u.board) {
                    result.roles.push(Roles.board, Roles.manager, Roles.volunteer);
                }
                else if (u.manager) {
                    result.roles.push(Roles.manager, Roles.volunteer);
                }
                else if (u.volunteer) {
                    result.roles.push(Roles.volunteer);
                }
                return (result);
            }
        }
        throw new Error(terms.invalidSignIn);
    }
    setAuthToken(token: string) {
        this.remult.setUser(new JwtHelperService().decodeToken(token));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        // sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        this.isConnected = true;
    }
    static fromStorage(): string {
        return localStorage.getItem(AUTH_TOKEN_KEY)!;
        // return sessionStorage.getItem(AUTH_TOKEN_KEY)!;
    }

    signOut() {
        this.remult.setUser(undefined!);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        // sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

export function getJwtTokenSignKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}