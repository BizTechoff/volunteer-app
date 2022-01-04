import * as aws from 'aws-sdk';
// const randomBytes = promisify(crypto.randomBytes)
//https://www.youtube.com/watch?v=yGYeYJpRWPM&ab_channel=SamMeech-Ward
export async function generateUploadURL(fName: string, branch: string) {

    const region = process.env.AWS_S3_IAM_BTO_REGION!
    const bucketName = process.env.AWS_S3_IAM_BTO_APP_BUCKET!
    const accessKeyId = process.env.AWS_S3_IAM_BTO_APP_ACCESS_KEY_ID!
    const secretAccessKey = process.env.AWS_S3_IAM_BTO_APP_SECRET_ACCESS_KEY!
    console.log('bucketName', bucketName)
    const s3 = new aws.S3({
        region,
        accessKeyId,
        secretAccessKey,
        signatureVersion: 'v4'
    })

    const params = ({
        Bucket: bucketName,
        Key: branch + "/" + fName,
        Expires: 60 //sec
    })

    console.log(JSON.stringify(params))

    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    // console.log('uploadURL', uploadURL)
    return uploadURL
}
