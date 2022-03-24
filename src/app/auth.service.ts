import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
    constructor(private remult: Remult, private router: Router) {
        // console.log('constructor', this.router.url)
        augmentRemult(remult);
        // (<MotiUserInfo>remult.user).snif
        let token = AuthService.fromStorage();
        if (token) {
            this.isFirstLogin = false;
            this.setAuthToken(token).then(() => { });
            // console.log('AuthService.constructor', remult.user)
        }
        // console.log('AuthService READY')
    } 

    async sendVerifyCode(mobile: string) {
        return await AuthService.sendVerifyCode(mobile)
    }

    @BackendMethod({ allowed: true })
    private static async sendVerifyCode(mobile: string, remult?: Remult): Promise<{ success: boolean, error: string, managerAsVolunteer: boolean }> {
        let result: { success: boolean, error: string, managerAsVolunteer: boolean } = { success: false, error: terms.wrongMobile, managerAsVolunteer: false };
        // console.log(1)
        if (mobile) {
            // console.log(2)

            mobile = mobileToDb(mobile) as string
            if (mobile.length > 0) {
                // console.log(3, mobile)
 
                let u = await remult?.repo(Users).findFirst({ mobile: mobile });
                // console.log(u?u:"NULL")
                if (u) {
                    // console.log(4)

                    result.managerAsVolunteer = u.manager! && u.volunteer!

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
                        result.success = true
                        result.error = terms.verificationCodeSuccesfullySent
                    }
                    else {
                        // console.log(5)

                        result.error = response.message
                    }
                }
            }
        }        
        // console.log(6)

        return result;
    }

    static generateCode() {
        let min = 700000
        let max = 999999
        return Math.floor(Math.random() * (max - min) + min)
    }

    getIPAddress() {
        // https://www.itsolutionstuff.com/post/how-to-get-client-ip-address-in-angularexample.html
        // import { HttpClientModule } from '@angular/common/http';
        // this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
        //   this.ipAddress = res.ip;
        // });
    }

    async signIn(mobile: string, code: string, managerAsVolunteer = false) {
        this.isConnected = false;
        let response = await AuthService.signIn(mobile, code, managerAsVolunteer)
        if (response.success) {
            await this.setAuthToken(response.token);
            // console.log('AuthService.signIn', this.remult.user)
        }
        return this.isConnected;
    }

    async swithToBranch(branch?: string) { 
        // localStorage.removeItem(AUTH_TOKEN_KEY);ks
        await this.setAuthToken(await AuthService.switchBranch(branch));
    }

    @BackendMethod({ allowed: Allow.authenticated })
    /*private*/ static async switchBranch(newBranchId?: string, remult?: Remult) {
        remult!.user.branch = newBranchId ?? undefined!;//maybe check if it's a valid branch for the user
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
                branch: u.bid?.id ?? '',
                branch2: u.branch2?.id ?? '',
                isReadOnly: false,
                isVolunteerMultiBrnach: false,
                isVolunteer: false,
                isManagerOrAbove: false,
                isBoardOrAbove: false,
                isAdmin: false
            };
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
            // ui.isVolunteerMultiBrnach = ui.roles.length == 1 && ui.roles.includes(Roles.volunteer) && u.bid && u.branch2 && u.bid?.id.length > 0 && u.branch2?.id.length > 0 ? true : false
        }
        else {
            ui = u as UserInfo
        }

        ui.isVolunteerMultiBrnach = ui.roles.length == 1 && ui.roles.includes(Roles.volunteer) && ui.branch && ui.branch.length > 0 && ui.branch2 && ui.branch2.length > 0 ? true : false
        ui.isReadOnly = ui.roles.length === 1 && ui.roles.includes(Roles.donor)
        ui.isVolunteer = ui.roles.length === 1 && ui.roles.includes(Roles.volunteer)
        ui.isManagerOrAbove = ui.roles.length === 1 && (ui.roles.includes(Roles.manager) || ui.roles.includes(Roles.board) || ui.roles.includes(Roles.donor) || ui.roles.includes(Roles.admin))
        ui.isBoardOrAbove = ui.roles.length === 1 && (ui.roles.includes(Roles.board) || ui.roles.includes(Roles.donor) || ui.roles.includes(Roles.admin))
        ui.isAdmin = ui.roles.length == 1 && ui.roles.includes(Roles.admin)

        // let days = `${process.env.TOKEN_EXPIRES_IN_DAYS!}d`
        // return jwt.sign(ui, getJwtTokenSignKey(), { expiresIn: days })
        return jwt.sign(ui, getJwtTokenSignKey());
    }

    isVolunteer() {
        return this.remult.isAllowed(Roles.volunteer) && this.remult.user.roles.length === 1
    }

    async setAuthToken(token: string) {
        this.isConnected = true;
        await this.remult.setUser(new JwtHelperService().decodeToken(token));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        // window?.location?.reload()
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