const AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
  console.log("Env variables: ", process.env.DB_TABLE);

  let region = process.env.AWS_REGION;
  const ddb = new AWS.DynamoDB.DocumentClient({ region: region });

  const params = {
    TableName: process.env.DB_TABLE,
  };

  ddb.scan(params, function (err, data) {
    if (err) {
      callback(respond(new Error(err.message), null));
    } else {
      callback(null, respond(200, data.Items));
    }
  });
};

function respond(status, items) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items,
    }),
  };
}
