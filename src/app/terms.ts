import { IdFilter, Remult } from 'remult';
import { Users } from './users/users';

export const terms = {
    searchReturnEmptyList: 'לא נמצאו דיירים תואמים לחיפוש שלך',
    assigns: 'שיבוצים',
    mustEnterBranch: 'סניף: שדה חובה',
    mustEnterTenant: 'דייר: שדה חובה',
    foods: 'מנות',
    uploads: 'העלאות',
    succefullyConnected: 'התחברת בהצלחה',
    wrongMobile: 'סלולרי שגוי',
    fromDate: 'מתאריך',
    toDate: 'עד תאריך',
    sendWelcomeSms: 'שלח מסרון התחברות',
    smsSuccefullySent: 'מסרון נשלח בהצלחה',
    smsFailSent: 'שליחת מסרון נכשלה',
    reminder4FoodDelivery: 'תזכורת לסמן אם מסרת את האוכל',
    validationCodeExpired: 'תוקף הקוד פג, יש לשלוח שוב קוד חדש',
    verificationCodeSendFailed: 'שליחת קוד אימות נכשלה',
    verificationCodeSuccesfullySent: 'קוד אימות נשלח בהצלחה',
    notificationVerificationCodeMessage: 'קוד אימות: !code! תקף לחמש דקות',
    sendVerificationCode: 'שלח שוב',
    verifying: 'אימות',
    verificatiobCodeNotSent: 'קוד אימות לא נשלח',
    wrongVerificatiobCode: 'קוד אימות שגוי',
    pleaseEnterVerificationCode: 'ברגעים אלה נשלח מסרון לסלולרי שלך המכיל קוד אימות, יש להזין אותו כאן',
    verificationCode: 'קוד אימות',
    foodDelivered: 'מסרתי לדייר את האוכל לשבת',
    foodCount: 'מנות',
    gender: 'מגדר',
    pointsExplain: 'הסבר צבירת נקודות',
    youGotMorePoint: 'צברת !points! נקודות נוספות, סה"כ צברת עד כה: !sum! נקודות',
    youMustEnterPurposes: 'לסגירת פעילות יש לציין מטרות שנמצאו',
    canNotRemoveActivityOrganizer: 'לא ניתן להסיר את מארגן הפעילות',
    canNotDeleteBrnachWhileRelationWithUsers: 'לא ניתן למחוק סניף כאשר מחובר למשתמש',
    canNotDeleteBrnachWhileRelationWithTenants: 'לא ניתן למחוק סניף כאשר מחובר לדייר',
    canNotDeleteBrnachWhileRelationWithActivities: 'לא ניתן למחוק סניף כאשר מחובר לפעילות',
    branchDeleteSuccefully: 'סניף !bname! נמחק בהצלחה',
    pointsYouHaveWithExplain: 'נקודות שצברת (דיווח מוצלח = !success!, העלאת תמונה\\וידאו = !upload!)',
    pointsYouHave: 'נקודות שצברת',
    emailMiddle1LettersError: 'אמצע האימייל לפחות תו אחד',
    emailSufix3LettersError: 'סיומת האימייל לפחות 3 תווים',
    emailPrefix3LettersError: 'תחילת האימייל לפחות 3 תווים',
    missingPoint: 'חסר נקודה (.) באימייל',
    missingAt: 'חסר את הסימן @ באימייל',
    colorRangeError: 'ערכי צבעים בין !min!-!max! צבע שגוי',
    canNotComeToActivityThisTime: 'לא אוכל להגיע',
    loadingYourActivities: 'מחפש פעילויות..',
    loadingYourTenants: 'מחפש דיירים..',
    doYouSureMarkActivityAs: 'האם לסמן פעילות כ!status!',
    showAssignTenants: 'דיירים משוייכים',
    mustCloseOldActivities: 'לא ניתן להקים פעילות חדשה כל עוד קיימת פעילות ישנה (!date!) שלא נסגרה עדיין',
    markAsStarted: 'סמן כפעילות שהתחילה',
    markAsEnded: 'סמן כפעילות שהסתיימה',
    // `https://calendar.google.com/calendar/ical/biztechoff.app%40gmail.com/public/basic.ics?`
    volunteerCalndarLink: `https://calendar.google.com/calendar/u/0/r/eventedit?` +
        `text=!title!` +
        `&dates=!fDate!/!tDate!` +
        `&location=!location!` +
        `&details=!details!` +
        `&trp=true` +
        `&sf=true` +
        `&output=xml#f`,
    voulnteerNewAssignSubject: '!branch!: תואמה לך פעילות עם הדייר !tname!',
    voulnteerUpdateAssignSubject: 'עודכנה לך פעילות עם הדייר: !tname!',
    voulnteerCancelAssignSubject: 'בוטלה לך פעילות עם הדייר: !tname!',
    passwordSentToYourEmail: 'סיסמא נשלחה לאמייל !email! ברגע זה',
    forgotPassword: 'שכחתי סיסמא',
    thankYou: 'תודה לך!',
    youGot200Points: 'צברת !points! נקודות',
    pleaseTellUsWhatGoingOn: 'הערות וסיכום פעילות',
    you: 'את/ה',
    me: 'אני',
    transferVolunteer: 'העברת מתנדב לסניף אחר',
    transferTenant: 'העברת דייר לסניף אחר',
    notVolunteersForCurrentTenant: 'לא שוייכו עדיין מתנדבים לדייר זה',
    associatedVolunteers: 'מתנדבים משוייכים',
    edit: 'עריכה',
    public: 'שתף באלבום הסניף',
    wrongPassword: 'סיסמא שגויה',
    save: 'שמור',
    age: 'גיל',
    continue: 'המשך',
    openPhotosAlbum: 'פתח אלבום תמונות',
    linkClicked: 'לינק נלחץ',
    voulnteerNewAssign: 'תודה על התנדבותך! תואמה !vnames! פעילות!purposeDesc! עם הדייר !name! בתאריך !date! משעה !from! עד שעה !to! בכתובת !address!',
    voulnteerUpdateAssign: 'עודכנה לך פעילות עם הדייר !name! בתאריך !date! משעה !from! עד שעה !to! בכתובת !address!',
    voulnteerCancelAssign: 'בוטלה לך פעילות עם הדייר !name! בתאריך !date! משעה !from! עד שעה !to! בכתובת !address!',
    referrer: 'גורם מפנה',
    foodDeliveryArea: 'איזור חלוקה',
    referrerRemark: 'שם גורם מפנה',
    volunteerNoActivities: 'תודה לך! כרגע אין לך פעילויות פתוחות',
    volunteerNoTenants: 'תודה לך! לא שוייכו לך עדיין דיירים',
    removeImage: 'הסרת תמונה',
    noPhotosOfYoursTogether: 'לא הועלו תמונות שלכם יחד',
    created: 'נוצר ב',
    createdBy: 'נוצר ע"י',
    modified: 'עודכן ב',
    modifiedBy: 'עודכן ע"י',
    uploadPhoto: 'העלאת תמונה',
    unpoladYoursPhotosTogether: 'העלו תמונות שלכם יחד',
    yoursDetailsSuccesfulySaved: 'פרטים עודכנו בהצלחה',
    langs: 'שפות',
    mustSetBidForSetVolunteers: 'חובה לבחור סניף לפני שיבוץ מתנדבים',
    mustSetBidForSetTenant: 'חובה לבחור סניף לפני שיבוץ דייר',
    selected: 'נבחרו',
    deleteUser: 'מחיקת יוזר',
    deleteVolunteer: 'מחיקת מתנדב',
    deleteTenant: 'מחיקת דייר',
    activitiesByWeekDay: 'פעילויות לפי ימי השבוע',
    activitiesByPurpose: 'פעילויות לפי מטרות',
    activitiesByBranches: 'פעילויות לפי סניפים',
    activitiesByStatuses: 'פעילויות לפי סטטוסים',
    activitiesByDayPeriods: 'פעילויות לפי זמני היום',
    activitiesByReferrer: 'פעילויות לפי גורם מפנה',
    refresh: 'רענן',
    print: 'הדפס',
    newActivity: 'פעילות חדשה',
    addActivityToCurrentTenant: 'הוסף פעילות לדייר זה',
    shouldAddActivity: 'האם להוסיף ל!t.name! פעילות חדשה?',
    shouldOpenTheActivity: 'לפתוח את הפעילות שהקמת כרגע?',
    serachForTenantNameHere: 'חיפוש לפי שם דייר..',
    serachForVolunteerHere: 'חיפוש לפי שם מתנדב..',
    serachByName: 'חיפוש לפי שם..',
    selectDate: 'בחירת תאריך',
    defaultPurposeDesc6: 'לארח חברה לספר ולהקשיב',
    showActivities: 'הצג פעילויות',
    opens: 'פתוחות',
    closes: 'סגורות',
    inProgress: 'בתהליך',
    endSuccess: 'הסתיימו בהצלחה',
    problems: 'בעיות',
    invalidBranch: 'סניף אינו תקין',
    defaultVolunteers: 'מתנדבים ברירת מחדל',
    appDesc: 'אפליקציה לניהול מפגשי התנדבות',
    addVolunteer: 'הוספת מתנדב חדש',
    addVolunteerToTenant: 'הוסף מתנדב לדייר',
    removeVolunteerFromTenant: 'הסר מתנדב מהדייר',
    requiredField: 'שדה חובה',
    donor: 'תורם',
    addBranch: 'הוספת סניף',
    addSecondBranch: 'שיוך סניף נוסף ל!user!',
    addTenant: 'הוספת דייר חדש',
    addActivity: 'הוספת פעילות',
    cancelActivity: 'בטל פעילות',
    sameDateAndTimes: 'לו"ז חופף',
    close: 'סגור',
    saveAndClose: 'שמור וסגור',
    commentAndSummary: 'הערות וסיכום פעילות',
    purpose: 'מטרה',
    passwordReset: 'סיסמא אופסה',
    resetPassword: 'איפוס סיסמא',
    tenantDetails: 'פרטי דייר',
    delete: 'מחק',
    volunteerDetails: 'פרטי מתנדב',
    activityDetails: 'פרטי פעילות',
    activity: 'פעילות',
    defaultTenant: 'דייר ברירת מחדל',
    entityType: 'סוג ישות',
    entityId: 'מזהה ישות',
    desc: 'תיאור',
    link: 'קישור',
    remark: 'הערות',
    name: 'שם',
    type: 'סוג',
    title: 'כותרת ראשית',
    tenant: 'דייר',
    branch: 'סניף',
    branch2: 'סניף נוסף',
    subTitle: 'כותרת משנית',
    volunteerApp: 'פעילות התנדבותית',
    currentStatus: 'סטטוס נוכחי',
    currentState: 'גרף פעילות',
    calendar: 'יומן פעילות',
    activities: 'פעילויות',
    tenants: 'דיירים',
    fromHour: 'משעה',
    toHour: 'עד שעה',
    date: 'תאריך',
    reports: 'דוחות',
    branches: 'סניפים',
    photoAlbum: 'אלבום תמונות',
    dailyActivityReport: 'דוח פעילות שבועי',
    volunteers: 'מתנדבים',
    email: 'דוא"ל',
    color: 'צבע',
    frame: 'הטמעה',
    photo: 'תמונה',
    active: 'פעיל',
    address: 'כתובת',
    addressRemark: 'הערות לכתובת',
    apartment: 'דירה',
    floor: 'קומה',
    phone: 'טלפון',
    photos: 'תמונות',
    data: 'מידע',
    birthday: 'תאריך לידה',
    status: 'סטטוס',
    mobile: "סלולרי",
    username: "שם משתמש",
    signIn: "כניסה",
    confirmPassword: "אימות סיסמא",
    signUp: "הירשמות",
    doesNotMatchPassword: "סיסמאות אינן תואמות",
    password: 'סיסמא',
    updateInfo: "עדכון פרטים",
    changePassword: "שינוי סיסמה",
    hello: "שלום",
    invalidOperation: "פעולה אינה חוקית",
    admin: 'אדמין',
    board: 'הנהלה',
    manager: 'מנהל סניף',
    volunteer: 'מתנדב',
    yes: 'כן',
    no: 'לא',
    ok: 'אישור',
    areYouSureYouWouldLikeToDelete: "האם למחוק את ה",
    cancel: 'ביטול',
    home: 'ברוכים הבאים',
    userAccounts: 'משתמשים',
    myActivities: 'הפעילויות שלי',
    myTenants: 'הדיירים שלי',
    filterBtTenantLangs: 'הצג לפי שפות הדייר',
    personalInfo: 'פרטים אישיים',
    invalidSignIn: "פרטי כניסה שגויים",
    signOut: 'התנתקות',
    emailFormatError: 'פורמט ___@_.___ אמייל שגוי',
    appVersion: '2022.02.15.0'
}

declare module 'remult' {
    export interface UserInfo {
        branch: string;
        branch2: string;
        isReadOnly: boolean;
        isVolunteerMultiBrnach: boolean;
        isVolunteer: boolean;
        isManagerOrAbove: boolean;
        isBoardOrAbove: boolean;
        isAdmin: boolean;
        // bname: string;
        // bid2: string;
        // b2name: string;
    }
    export interface Remult {
        branchAllowedForUser(): IdFilter<import('./core/branch/branch').Branch>
        hasValidBranch(): boolean
    }
}

// declare class 'system' {
//     export interface string {
//         isNotEmpty = (s: string) => { s && s.trim().length > 0 }
//     }
// }

export function augmentRemult(remult: Remult) {
    remult.branchAllowedForUser = () => {
        if (!remult.user.branch || remult.user.branch.trim().length === 0) {// if (remult.isAllowed(Roles.board))
            return undefined!;
        }
        let bids = [remult.user.branch]
        // if(remult.user.branch2 && remult.user.branch2.length > 0){
        //     bids.push(remult.user.branch2)
        // }
        // if (remult.user.isVolunteerMultiBrnach) {
        //     let u: Users = undefined!
        //     remult.repo(Users).findId(remult.user.id).then(_ => u = _)
        //     if (u && u.branch2) {
        //         bids.push(u.branch2.id)
        //     }
        // }
        return { $id: bids };
    }
    remult.hasValidBranch = () => {
        if (remult.user.branch) {
            if (remult.user.branch.trim().length > 0) {
                return true
            }
        }
        return false
    }
}
