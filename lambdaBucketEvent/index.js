var AWS = require("aws-sdk");

exports.handler = function(event, context, callback) {
    console.log(event);
    
    var s3ObjectKey = event.Records[0].s3.object.key;
    var s3ObjectSize = event.Records[0].s3.object.size;
    var s3ObjectTime = event.Records[0].eventTime;
    
    console.log("Object Key: " + s3ObjectKey + " - Time: " + s3ObjectTime);
    
    // Create dynamo service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    
    var params = {
        TableName: 'cloud9HelloTable',
        Item: {
            'id': {S: s3ObjectKey},
            'timestamp': {S: s3ObjectTime},
            'size': {S: s3ObjectSize.toString()}
        }
    }
    
    // Call Dynamo DB to add the items to the table.
    ddb.putItem(params, function(error, data){
        if(error){
            console.log("An error accured while adding an item", error);
        } else {
            console.log("Successfully added " + s3ObjectKey + " into table");
        }
    });
    callback();
};
