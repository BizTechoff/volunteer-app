import { FieldRef, Filter, IdEntity } from "remult";
import { terms } from "../terms";

export const FILTER_IGNORE: Filter = new Filter(x => { return true; });
export const FILTER_RESTRICT: Filter = new Filter(x => { return false; });


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
    if (!ok!)
        col.error = terms.requiredField;
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

export const ColorNumberValidator = (_: any, col: FieldRef<any, string>) => {
    // console.log(col.value);
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if (ok) {
        let v = parseInt(col.value);
        ok &&= (v >= 0 && v <= 11);
        {

        }
    }
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
            if(split[0].length < 3){
                ok = false;
                message = terms.emailPrefix3LettersError;
            }
            split = split[1].split('.');
            if (split.length < 2) {
                ok = false;
                message = terms.missingPoint;
            }
            else if(split[0].length < 1){
                ok = false;
                message = terms.emailMiddle1LettersError;
            }
            else if(split[1].length < 3){
                ok = false;
                message = terms.emailSufix3LettersError;
            }
        }
    }
    if (!ok!)
        col.error = message;
}
