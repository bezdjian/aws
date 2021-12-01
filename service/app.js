let AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const multipart = require('aws-lambda-multipart-parser');

let dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
let s3 = new AWS.S3();

let bucketName;
let bucketKey;
let id;

exports.lambdaHandler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = true;

    try {
        id = uuid();

        return uploadAgreement(event)
            .then(uploadResult => {
                console.log(`File uploaded successfully at ${uploadResult.Location}`);
                return saveMetadataToDynamo(event);
            }).then(dbResult => {
                console.log(`Metadata has been saved to DB with id ${id}`, dbResult);
                callback(null, response(200, `Agreement with id ${id} has been saved!`))
            }).catch(err => {
                callback(null, response(500, `Error while uploading the agreement: ${err}`));
            })
    }
    catch (err) {
        callback(null, response(500, `Application error: ${err}`));
    }
};

function uploadAgreement(event) {
    const params = createBucketParameters(event);
    return s3.upload(params).promise();
}

function saveMetadataToDynamo(event) {
    var queryParameters = event.queryStringParameters
    var dbParameters = createDbParameters(queryParameters)
    return dynamodb.putItem(dbParameters).promise();
}

function createBucketParameters(event) {
    var file = multipart.parse(event, true).file
    var pathFolder = event.queryStringParameters.documentType

    bucketName = process.env.ARCHIVE_BUCKET
    bucketKey = `${pathFolder}/${event.queryStringParameters.ssn}_${file.filename}`

    return {
        Bucket: bucketName,
        Key: bucketKey,
        Body: file.content,
        ContentType: file.contentType
    };
}

function createDbParameters(parameters) {
    var ssn = parameters.ssn
    var source = parameters.source
    var internalReference = parameters.internalReference
    var documentType = parameters.documentType

    var db_table = process.env.DB_TABLE

    return {
        TableName: db_table,
        Item: {
            "id": {
                S: id
            },
            "internalReference": {
                S: internalReference
            },
            "SSN": {
                S: ssn
            },
            "timestamp": {
                S: new Date().toLocaleString()
            },
            "bucketName": {
                S: bucketName
            },
            "bucketKey": {
                S: bucketKey
            },
            "source": {
                S: source
            },
            "docuemtType": {
                S: documentType
            }
        }
    };
}

function response(status, message) {
    return {
        statusCode: status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    }
}