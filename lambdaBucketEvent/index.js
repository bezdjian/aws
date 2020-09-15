var AWS = require("aws-sdk");

exports.handler = function(event, context, callback) {
    console.log(event);
    
    var s3ObjectKey = event.Records[0].s3.object.key;
    var s3ObjectSize = event.Records[0].s3.object.size;
    var s3ObjectTime = event.Records[0].eventTime;
    var s3BucketName = event.Records[0].s3.bucket.name;
    
    console.log("Object Key: " + s3ObjectKey + " - Time: " + s3ObjectTime + " - BucketName: " + s3BucketName);
    
    // Create dynamo service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    // Create params with the values to save into the table.
    var params = createDBParam(s3ObjectKey, s3ObjectTime, 
                s3ObjectSize.toString(), s3BucketName);
    // Call Dynamo DB to add the items to the table.
    ddb.putItem(params, function(error, data){
        if(error){
            callback(respond(500, "An error accured while adding an item" + error.message));
        } else {
            callback(null, respond(200, "Successfully added " + s3ObjectKey + " into table"));
        }
    });
};

function createDBParam(key, time, size, bucketName){
    return {
        TableName: 'cloud9HelloTable',
        Item: {
            'id': {S: key},
            'timestamp': {S: time},
            'size': {S: size},
            'bucket_name': {S: bucketName}
        }
    };
}

function respond(status, message){
    return {
      statusCode: status,
      body: JSON.stringify({
        message: message
      }),
};
}