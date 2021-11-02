import { userInfo } from "os";
import { FieldRef, Filter } from "remult";
import { terms } from "../terms";
import { Users } from "../users/users";

export const FILTER_IGNORE: Filter = new Filter(x => { return true; });


export const DateRequiredValidation = (_: any, col: FieldRef<any, Date>) => {
    let ok = col.value && col.value.getFullYear() > 1900 ? true : false;
    if (!ok!)
        col.error = terms.requiredField;
}

export const StringRequiredValidation = (_: any, col: FieldRef<any, string>) => {
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if (!ok!)
        col.error = terms.requiredField;
}

export const TimeRequireValidator = (_: any, col: FieldRef<any, string>) => {
    let ok = col.value && col.value.trim().length > 0 ? true : false;
    if(ok){
        ok &&= col.value !== '00:00' &&  col.value !== '--:--';
    }
    if (!ok!)
        col.error = terms.requiredField;
}

// export  interface UserInfoEx extends userInfo{
// constructor(){super();}
// }



export const ValidBranchValidation = (_: any, col: FieldRef<Users, string>) => {
    let ok = true;
    console.log('ValidBranchValidation-1');
    if (!col.entityRef.fields.board && col.entityRef.fields.volunteer) {
        console.log('ValidBranchValidation-2');
        ok &&= col.entityRef.fields.bid && col.entityRef.fields.bid.value && col.entityRef.fields.bid.value.length > 1 ? true : false;
        ok &&= col.entityRef.fields.bid.value !== '0';
    }
    console.log('ValidBranchValidation-3');
    if (!ok!) {
        console.log('ValidBranchValidation-4');
        col.error = terms.requiredField;
    }
}