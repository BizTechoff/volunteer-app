import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";

@ValueListFieldType()
export class Gender {
    static unKnown = new Gender(0, 'לא ידוע');
    static male = new Gender(1, 'זכר');
    // static inProgress = new ActivityGeneralStatus(2, 'בתהליך', ActivityStatus.inProgressStatuses());
    static female = new Gender(2, 'נקבה');
    constructor(public id: number, public caption: string) { }
    
    static getOptions() {
        let op = new ValueListValueConverter(Gender).getOptions();
        return op;
    }

    static fromStringByCaption(caption: string) {
        let result: Gender = Gender.unKnown;
        let options = Gender.getOptions();
        let found = options.find(_ => _.caption === caption);
        if (found) {
            result = found
        }
        return result;
    }
}

@ValueListFieldType()
export class FoodDeliveredCount {
    static one = new FoodDeliveredCount(1, 'מנה 1');
    // static inProgress = new ActivityGeneralStatus(2, 'בתהליך', ActivityStatus.inProgressStatuses());
    static two = new FoodDeliveredCount(2, '2 מנות');
    constructor(public id: number, public caption: string) { }
    
    static getOptions() {
        let op = new ValueListValueConverter(FoodDeliveredCount).getOptions();
        return op;
    }

    static fromStringById(id: number) {
        let result: FoodDeliveredCount = FoodDeliveredCount.one;
        let options = FoodDeliveredCount.getOptions();
        let found = options.find(_ => _.id === id);
        if (found) {
            result = found
        }
        return result;
    }
}
