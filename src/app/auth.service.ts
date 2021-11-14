import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as jwt from 'jsonwebtoken';
import { BackendMethod, Remult, UserInfo } from 'remult';
import { terms } from './terms';
import { Roles } from './users/roles';
import { Users } from './users/users';

const AUTH_TOKEN_KEY = "authToken";
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    forgotPassword = false;
    isFirstLogin = true;//welcome message
    constructor(private remult: Remult) {
        // (<MotiUserInfo>remult.user).snif
        let token = AuthService.fromStorage();
        if (token) {
            this.isFirstLogin = false;
            this.setAuthToken(token);
        }
    }

    async signIn(username: string, password: string) {
        this.setAuthToken(await AuthService.signIn(username, password));
    }
    @BackendMethod({ allowed: true })
    static async signIn(user: string, password: string, remult?: Remult) {
        //which user is here? probably kind of a system user
        let u = await remult!.repo(Users).findFirst(h => h.name.isEqualTo(user));
        if (u) {
            if (await u.passwordMatches(password)) {
                let result: UserInfo = {
                    id: u.id,
                    roles: [],
                    name: u.name,
                    bid: u.bid?.id ?? '',
                    bname: u.bid?.name ?? ''
                };
                if (u.admin) {
                    result.roles.push(Roles.admin, Roles.board, Roles.manager, Roles.volunteer);
                }
                else if (u.donor) {
                    result.roles.push(Roles.board, Roles.manager, Roles.volunteer);
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
                return (jwt.sign(result, getJwtTokenSignKey()));
            }
            // throw new Error(terms.wrongPassword);
        }
        throw new Error(terms.invalidSignIn);
    }
    setAuthToken(token: string) {
        this.remult.setUser(new JwtHelperService().decodeToken(token));
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    static fromStorage(): string {
        return sessionStorage.getItem(AUTH_TOKEN_KEY)!;
    }

    signOut() {
        this.remult.setUser(undefined!);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

export function getJwtTokenSignKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}