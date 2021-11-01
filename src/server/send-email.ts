import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
//import * as nodemailer from 'nodemailer'
import { Remult } from 'remult';
import { EmailSvc } from '../app/common/utils';
//
EmailSvc.sendMail = async (subject: string, message: string, email: string, remult: Remult) => {

    var transporter = createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'motidru@gmail.com',
            pass: 'Monns2012!'
        }
    });

    var mailOptions : Mail.Options = {
        from: 'motidru@gmail.com',
        to: 'motidru@gmail.com',
        subject: 'subject test'
    };
    new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                console.log('mail.error');
                console.log(error);
                rej(error);
            } else {
                console.log('mail.ok');
                res(true);
                console.log('Email sent: ' + info.response);
            }
        });
    });
    return true;

}
