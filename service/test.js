let AWS = require('aws-sdk');
let s3 = new AWS.S3();

const params = {
    Bucket: "archive-service-bucket-397178420157",
    Key: "agreements/archive.txt",
    Body: "file.content",
    ContentType: "text/plain"
};

console.log("***** params: ", params.Bucket);
console.log("***** params: ", params.Key);

s3.upload(params, (err, data) => {
    if (err) {
        console.log("Error while uploading file to S3: ", err)
        throw err
    }
    console.log(`File uploaded successfully at ${data.Location}`);
});