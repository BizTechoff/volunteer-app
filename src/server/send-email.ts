import { createTransport } from 'nodemailer';
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
            user: process.env.ADMIN_GMAIL_MAIL,
            pass: process.env.ADMIN_GMAIL_PASS
        }
    });

    var mailOptions = {
        from: '"אשל ירושלים" <volunteer@eshel.org.il>',
        to: email,
        subject: subject,
        html: message
    };
    new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                rej(error);
            } else {
                res(true);
                console.log('Email sent: ' + info.response);
            }
        });
    });
    return true;

}
