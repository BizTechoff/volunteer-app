import * as aws from 'aws-sdk';
import { isDevMode } from '.';
// const randomBytes = promisify(crypto.randomBytes)
//https://www.youtube.com/watch?v=yGYeYJpRWPM&ab_channel=SamMeech-Ward
export async function generateUploadURL(fName: string, branch: string) {

    console.debug(`sendToS3: { fName: ${fName}, branch: ${branch} }`);

    if (process.env.S3_CHANNEL_OPENED === 'true') {

        const region = process.env.AWS_S3_IAM_BTO_REGION!
        const bucketName = process.env.AWS_S3_IAM_BTO_APP_BUCKET!
        const accessKeyId = process.env.AWS_S3_IAM_BTO_APP_ACCESS_KEY_ID!
        const secretAccessKey = process.env.AWS_S3_IAM_BTO_APP_SECRET_ACCESS_KEY!
        // console.log('bucketName', bucketName)
        const s3 = new aws.S3({
            region,
            accessKeyId,
            secretAccessKey,
            signatureVersion: 'v4'
        })

        const params = ({
            Bucket: bucketName,
            Key: (isDevMode() ? 'dev/' : '') + branch + "/" + fName,
            Expires: 60 //sec
        })

        // console.log(JSON.stringify(params))

        const uploadURL = await s3.getSignedUrlPromise('putObject', params)
        // console.log('uploadURL', uploadURL)
        return uploadURL
    }
    else {
        console.debug('sendToS3.error: aws-S3 Cahnnel is Closed!!');
        return '';
    }
}
