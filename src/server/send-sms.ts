import * as fetch from 'node-fetch';
import { SmsRequest } from '../app/common/types';
import { NotificationService } from '../app/common/utils';
// import { SendSmsResponse } from '../app/common/types';

export interface SendSmsResponse {
    success: boolean,
    message: string,
    count: number
};

NotificationService.sendSms = async (req: SmsRequest): Promise<{ success: boolean, message: string, count: number }> => {
    let result: SendSmsResponse = { success: false, message: 'Sms channel is close!', count: 0 };

    console.debug(`sendSms: ${JSON.stringify(req)}`);
    // console.log(process.env.SMS_CHANNEL_OPENED, process.env.SMS_CHANNEL_OPENED === 'true')
    if (process.env.SMS_CHANNEL_OPENED === 'true') {
        let usa = req.mobile.startsWith('1')
        let url = process.env.SMS_URL!
            .replace('!user!', process.env.SMS_ACCOUNT!)
            .replace('!password!', process.env.SMS_PASSWORD!)
            .replace('!from!', process.env.SMS_FROM_NAME!)
            .replace('!mobile!', req.mobile)
            .replace('!message!', encodeURI(req.message))
            .replace('!userid!', req.uid)
            .replace('!international!', usa ? '1' : '0');
 
        // .replace('!schedule!', '0000-00-00+00:00:00')

        if (usa) {
            console.debug('url', url);
        }
        let r = await fetch.default(url, {//require('node-fetch').
            method: 'GET'
        });
        if (r.ok) {
            let res = JSON.parse(await r.text());// as SendSmsResponse;
            result.success = res.success;
            result.message = res.message ? res.message : res.error ? JSON.stringify(res.error) : 'unKnown';
            result.count = res.smsCount;
            console.debug(`sendSms.res: ${JSON.stringify(res)}`);
            // console.debug(`sendSms.result: ${JSON.stringify(result)}`);
        }
        else {
            result.message = `status: ${r.status}, statusText: ${r.statusText} }`;
            console.debug(`sendSms.error: { status: ${r.status}, statusText: ${r.statusText} } `);
        }
    }
    else {
        console.debug(`sendSms.return: Sms channel is close!`);
    }

    return result;
}
