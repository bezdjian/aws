var mysql = require('mysql');
var config = require('./db.json');
var User = require('./model/User');

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database

});

exports.lambdaHandler = (event, context) => {
  console.log("Event: ", event);
  // queryStringParameters
  // pathParameters
  //if (event && event.body) {

  //var body = JSON.parse(event.body);

  //if (body.name) {
  var list = [];

  pool.getConnection((error, connection) => {
    console.time("timer");
    if (error) {
      context.fail(error);
    }

    connection.query("SELECT * FROM user", (error, result, fields) => {

      if (error) {
        context.fail(error);
      }

      Object.keys(result).forEach((key) => {
        var row = result[key];
        var user = new User(row.id, row.firstname, row.lastname);
        list.push(user.toJson());
      });
      connection.release();
      console.timeEnd("timer");
      context.succeed(
        respond(200, list)
      );
    });
  });

  /*} else {
    context.fail('Name should be in body payload!');
  }
} else {
  context.fail('Body with name attribute is missing in payload!');
}*/
};


function respond(status, message) {
  return {
    'statusCode': status,
    'body': JSON.stringify(message)
  };
}