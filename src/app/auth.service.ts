import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as jwt from 'jsonwebtoken';
import { Allow, BackendMethod, Remult, UserInfo } from 'remult';
import { mobileToDb, validVerificationCodeResponseMinutes } from './common/globals';
import { NotificationService } from './common/utils';
import { augmentRemult, terms } from './terms';
import { Roles } from './users/roles';
import { Users } from './users/users';
// if (await u.passwordMatches(password))

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

    async sendVerifyCode(mobile: string) {
        return await AuthService.sendVerifyCode(mobile)
    }

    @BackendMethod({ allowed: true })
    private static async sendVerifyCode(mobile: string, remult?: Remult): Promise<{ success: boolean, error: string }> {
        let result: { success: boolean, error: string } = { success: false, error: terms.wrongMobile };
        if (mobile) {
            mobile = mobileToDb(mobile)
            if (mobile.length > 0) {
                let u = await remult?.repo(Users).findFirst({ mobile: mobile });
                if (u) {
                    let code = AuthService.generateCode();
                    u.verifyCode = code.toString()
                    u.verifyTime = new Date()
                    await u.save()

                    let response = await NotificationService.SendSms({
                        mobile: mobile,
                        uid: u.id,
                        message: terms.notificationVerificationCodeMessage
                            .replace('!code!', code.toString())
                    })
                    if (response.success) {
                        result.error = terms.verificationCodeSuccesfullySent
                    }
                    else {
                        result.error = response.message
                    }
                }
            }
        }
        return result;
    }

    static generateCode() {
        let min = 700000
        let max = 999999
        return Math.floor(Math.random() * (max - min) + min)
    }

    async signIn(mobile: string, code: string) {
        this.isConnected = false;
        let response = await AuthService.signIn(mobile, code);
        if (response.success) {
            this.setAuthToken(response.token);
            this.isConnected = true;
        }
        return this.isConnected;
    }

    async swithToBranch(branch?: string) {
        this.setAuthToken(await AuthService.switchBranch(branch));
    }

    @BackendMethod({ allowed: Allow.authenticated })
    static async switchBranch(newBranchId?: string, remult?: Remult) {
        remult!.user.bid = newBranchId ?? undefined!;//maybe check if it's a valid branch for the user
        return jwt.sign(remult!.user, getJwtTokenSignKey())
    }

    @BackendMethod({ allowed: true })
    private static async signIn(mobile: string, code: string, remult?: Remult): Promise<{ success: boolean, error: string, token: string }> {
        let result: { success: boolean, error: string, token: string } = { success: false, error: 'נתונים שגויים', token: '' }
        if (mobile && mobile.length > 0 && code && code.length > 0) {
            mobile = mobileToDb(mobile)
            let u = await remult!.repo(Users).findFirst({ mobile: mobile });
            if (u) {
                let special = code === process.env.SMS_ADMIN_VERIFICATION_CODE!
                if (special) {
                    result.success = true;
                    result.error = 'easter egg'
                    result.token = AuthService.doSignIn(u)
                }
                else if (u.verifyTime && u.verifyTime.getFullYear() > 1900) {//has sent
                    let now = new Date();
                    let minValidTime = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                        now.getHours(),
                        now.getMinutes() - validVerificationCodeResponseMinutes);
                    if (u.verifyTime < minValidTime) {
                        result.error = terms.validationCodeExpired;
                    }
                    else if (u.verifyCode === code) {
                        result.success = true
                        result.error = terms.succefullyConnected
                        result.token = AuthService.doSignIn(u)
                    }
                    else {
                        result.error = terms.wrongVerificatiobCode
                    }
                }
                else {
                    result.error = terms.verificatiobCodeNotSent
                }
            }
            else {
                result.error = terms.wrongMobile
            }
        }
        return result
    }

    private static doSignIn(u: Users) {
        let ui: UserInfo = {
            id: u.id,
            roles: [],
            name: u.name,
            bid: u.bid?.id ?? '',
            bname: u.bid?.name ?? '',
            bid2: u.branch2?.id ?? '',
            b2name: u.branch2?.name ?? ''
        };
        if (u.admin) {
            ui.roles.push(Roles.admin, Roles.board, Roles.manager, Roles.volunteer);
        }
        else if (u.donor) {
            ui.roles.push(Roles.donor, Roles.board, Roles.manager, Roles.volunteer);
        }
        else if (u.board) {
            ui.roles.push(Roles.board, Roles.manager, Roles.volunteer);
        }
        else if (u.manager) {
            ui.roles.push(Roles.manager, Roles.volunteer);
        }
        else if (u.volunteer) {
            ui.roles.push(Roles.volunteer);
        }
        return jwt.sign(ui, getJwtTokenSignKey())
    }

    setAuthToken(token: string) {
        // console.log('setAuthToken 1', this.remult.user)
        this.remult.setUser(new JwtHelperService().decodeToken(token));
        // console.log('setAuthToken 2', this.remult.user)
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