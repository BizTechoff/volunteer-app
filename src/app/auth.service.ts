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
            console.log('AuthService.constructor', remult.user)
        }
    }

    async sendVerifyCode(mobile: string) {
        return await AuthService.sendVerifyCode(mobile)
    }

    @BackendMethod({ allowed: true })
    private static async sendVerifyCode(mobile: string, remult?: Remult): Promise<{ success: boolean, error: string, managerAsVolunteer: boolean }> {
        let result: { success: boolean, error: string, managerAsVolunteer: boolean } = { success: false, error: terms.wrongMobile, managerAsVolunteer: false };
        if (mobile) {
            mobile = mobileToDb(mobile) as string
            if (mobile.length > 0) {
                let u = await remult?.repo(Users).findFirst({ mobile: mobile });
                if (u) {
                    let code = AuthService.generateCode();
                    u.verifyCode = code.toString()
                    u.verifyTime = new Date()
                    await u.save()
                    result.managerAsVolunteer = u.manager! && u.volunteer!

                    let response = await NotificationService.SendSms({
                        mobile: mobile,
                        uid: u.id,
                        message: terms.notificationVerificationCodeMessage
                            .replace('!code!', code.toString())
                    })
                    if (response.success) {
                        result.success = true
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

    async signIn(mobile: string, code: string, managerAsVolunteer = false) {
        this.isConnected = false;
        let response = await AuthService.signIn(mobile, code, managerAsVolunteer)
        if (response.success) {
            this.setAuthToken(response.token);
            console.log('AuthService.signIn', this.remult.user)
        }
        return this.isConnected;
    }

    async swithToBranch(branch?: string) {
        this.setAuthToken(await AuthService.switchBranch(branch));
    }

    @BackendMethod({ allowed: Allow.authenticated })
    /*private*/ static async switchBranch(newBranchId?: string, remult?: Remult) {
        remult!.user.bid = newBranchId ?? undefined!;//maybe check if it's a valid branch for the user
        return await AuthService.buildToken(remult!.user)
    }

    @BackendMethod({ allowed: true })
    private static async signIn(mobile: string, code: string, managerAsVolunteer = false, remult?: Remult): Promise<{ success: boolean, error: string, token: string }> {
        let result: { success: boolean, error: string, token: string } = { success: false, error: 'נתונים שגויים', token: '' }
        if (mobile && mobile.length > 0 && code && code.length > 0) {
            mobile = mobileToDb(mobile) as string
            let u = await remult!.repo(Users).findFirst({ mobile: mobile });
            if (u) {
                let special = code === process.env.SMS_ADMIN_VERIFICATION_CODE!
                if (special) {
                    result.success = true;
                    result.error = 'easter egg'
                    result.token = await AuthService.buildToken(u, managerAsVolunteer)
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
                        result.token = await AuthService.buildToken(u, managerAsVolunteer)
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

    private static async buildToken(u: Users | UserInfo, managerAsVolunteer = false) {
        let ui: UserInfo;
        if (u instanceof Users) {
            ui = {
                id: u.id,
                roles: [],
                name: u.name,
                bid: u.bid?.id ?? '',
                isReadOnly: false,
                isVolunteerMultiBrnach: false,
                isVolunteerOnly: false,
                isBoardOrDonorOrAdmin: false
                // bname: u.bid?.name ?? '',
                // bid2: u.branch2?.id ?? '',
                // b2name: u.branch2?.name ?? ''
            };
            // if (u.admin) {
            //     ui.roles.push(Roles.admin, Roles.board, Roles.manager, Roles.volunteer);
            // }
            // else if (u.donor) {
            //     ui.roles.push(Roles.donor, Roles.board, Roles.manager, Roles.volunteer);
            // }
            // else if (u.board) {
            //     ui.roles.push(Roles.board, Roles.manager, Roles.volunteer);
            // }
            // else if (u.manager) {
            //     ui.roles.push(Roles.manager, Roles.volunteer);
            // }
            // if (u.volunteer) {
            //     ui.roles.push(Roles.volunteer);
            // }
            if (u.admin) {
                ui.roles.push(Roles.admin);
            }
            else if (u.donor) {
                ui.roles.push(Roles.donor);
            }
            else if (u.board) {
                ui.roles.push(Roles.board);
            }
            else if (u.manager || u.volunteer) {
                if (u.manager && u.volunteer) {
                    if (managerAsVolunteer) {
                        ui.roles.push(Roles.volunteer);
                    }
                    else {
                        ui.roles.push(Roles.manager);
                    }
                }
                else if (u.manager) {
                    ui.roles.push(Roles.manager);
                }
                else if (u.volunteer) {
                    ui.roles.push(Roles.volunteer);
                }
            }

            ui.isReadOnly = ui.roles.length === 1 && ui.roles.includes(Roles.donor)
            ui.isVolunteerMultiBrnach = u.bid && u.branch2 && u.bid?.id.length > 0 && u.branch2?.id.length > 0 ? true : false
            ui.isVolunteerOnly = ui.roles.length === 1 && ui.roles.includes(Roles.volunteer)
            ui.isBoardOrDonorOrAdmin = ui.roles.length === 1 && (ui.roles.includes(Roles.board) || ui.roles.includes(Roles.donor) || ui.roles.includes(Roles.admin))

        }
        else {
            ui = u as UserInfo
        }

        return jwt.sign(ui, getJwtTokenSignKey())
    }

    isVolunteerOnly() {
        return this.remult.isAllowed(Roles.volunteer) && this.remult.user.roles.length === 1
    }

    // getUserBranches() {
    //     let result = [] as string[];
    //     if (this.remult.user.bid) {
    //         result.push(this.remult.user.bid)
    //     }
    //     if (this.remult.user.bid2) {
    //         result.push(this.remult.user.bid2)
    //     }
    //     return result;
    // }

    async setAuthToken(token: string) {
        this.remult.setUser(new JwtHelperService().decodeToken(token));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
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