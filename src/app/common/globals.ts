import { FieldRef, Filter, IdEntity } from "remult";
import { Activity, ActivityPurpose, ActivityStatus } from "../core/activity/activity";
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
