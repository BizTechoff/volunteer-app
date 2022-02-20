import { FieldRef, IdEntity } from "remult";
import { terms } from "../terms";


export const OnlyVolunteerEditActivity = true;
// export const useVolunteerLoginWithVerificationCode = true;
export const validVerificationCodeResponseMinutes = 5;
export const pointsEachSuccessActivity = 500;
export const pointsEachSuccessMedia = 200;
// export const pointsEachSuccessPhoto = 200;
// export const pointsEachSuccessVideo = 200;
// export const pointsForSurprise = 2000;
export const mediaAllowedUploadFileTypes = 'audio/mp3,video/mp4,video/avi,image/png,image/jpg,image/jpeg';
export const uploadS3WithFileExtention = false;

export const DateRequiredValidation = (_: any, col: FieldRef<any, Date>) => {
    let ok = col.value && col.value.getFullYear() > 1900 ? true : false;
    if (!ok!)
        col.error = terms.requiredField;
}

export const EntityRequiredValidation = (_: any, col: FieldRef<any, IdEntity>) => {
    let ok = col.value && col.value.id && col.value.id.length > 0 ? true : false;
    if (!ok!)
        col.error = terms.requiredField;
}

export const StringRequiredValidation = (_: any, col: FieldRef<any, string>) => {
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if (!ok!) {
        col.error = terms.requiredField;
    }
    // else {

    // }

    // col.dbTo = 0501234567;
    // col.dbFrom = 050-1234-567
}

export const TimeRequireValidator = (_: any, col: FieldRef<any, string>) => {
    // console.log(col.value);
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if (ok) {
        ok &&= col.value !== '00:00' && col.value !== '--:--';
    }
    if (!ok!)
        col.error = terms.requiredField;
}

export const ColorNumberValidator = (_: any, col: FieldRef<any, number>) => {
    // console.log(col.value);
    let ok = col && col.value >= 1 && col.value <= 11 ? true : false;
    // if (ok) {
    //     // let v = parseInt(col.value);
    //     ok &&= (v >= 0 && v <= 11);
    // }
    if (!ok!)
        col.error = terms.colorRangeError.replace('!min!', '1').replace('!max!', '11');
}

export const EmailValidator = (_: any, col: FieldRef<any, string>) => {
    // console.log(col.value);
    let message = '';
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if (ok) {
        let split = col.value.split('@');
        if (split.length < 2) {
            ok = false;
            message = terms.missingAt;
        }
        else {
            if (split[0].length < 3) {
                ok = false;
                message = terms.emailPrefix3LettersError;
            }
            split = split[1].split('.');
            if (split.length < 2) {
                ok = false;
                message = terms.missingPoint;
            }
            else if (split[0].length < 1) {
                ok = false;
                message = terms.emailMiddle1LettersError;
            }
            else if (split[1].length < 3) {
                ok = false;
                message = terms.emailSufix3LettersError;
            }
        }
    }
    if (!ok!)
        col.error = message;
}

export const mobileFromDb = (mobile: string) => {
    let result = '';// [0]00-0000-000
    if (mobile && mobile.length > 0) {
        let last = mobile.length - 3;
        if (last > 0) {
            result = mobile.substring(0, last) + '-' + mobile.substring(last);

            let first = result.length - 7 - 1;//'-'
            if (first > 0) {
                result = result.substring(0, first) + '-' + result.substring(first);
            }
        }
    }
    return result;
}

export const mobileToDb = (mobile: string, mobile2?: string): boolean | string => {
    let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let fixedMobile = '';// [0]000000000
    if (mobile && mobile.length > 0) {
        for (const c of mobile) {
            if (digits.includes(c)) {
                fixedMobile += c;
            }
        }
    }
    if (fixedMobile.length > 0) {
        fixedMobile = fixedMobile.padStart(10, '0');
        if (!fixedMobile.startsWith('05')) {
            if (!fixedMobile.startsWith('000')) {
                if (fixedMobile.startsWith('00')) {
                    fixedMobile = fixedMobile.substring(1);//02,03,..
                }
            }
        }
    }

    if (mobile2 && mobile2.length > 0) {
        let fixedMobile2 = '';// [0]000000000
        for (const c of mobile2) {
            if (digits.includes(c)) {
                fixedMobile2 += c;
            }
        }
        if (fixedMobile2.length > 0) {
            fixedMobile2 = fixedMobile2.padStart(10, '0');
            if (!fixedMobile2.startsWith('05')) {
                if (!fixedMobile2.startsWith('000')) {
                    if (fixedMobile2.startsWith('00')) {
                        fixedMobile2 = fixedMobile2.substring(1);//02,03,..
                    }
                }
            }
        }

        return fixedMobile === fixedMobile2
    }

    return fixedMobile;
}
