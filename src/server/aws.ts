// import * as AWS from 'aws-sdk';
// import * as fs from 'fs';

// export function uploadFile(fileName: string) {
//     //https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
//     // const AWS = require('aws-sdk');
//     // const fs = require('fs');
//     const s3 = new AWS.S3({
//         accessKeyId: process.env.AWS_S3_IAM_BTO_APP_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_S3_IAM_BTO_APP_SECRET_ACCESS_KEY
//     });
//     const fileContent = fs.readFileSync(fileName);
//     const params: AWS.S3.Types.PutObjectRequest = {
//         Bucket: process.env.AWS_S3_IAM_BTO_APP_BUCKET!,
//         Key: fileName, // File name you want to save as in S3
//         Body: fileContent
//         // CreateBucketConfiguration: {
//         //     // Set your region here
//         //     LocationConstraint: "us-east-1"
//     };
//     s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
//         if (err) {
//             throw err;
//         }
//         console.log(`File uploaded successfully. ${data.Location}`);
//     });
// }