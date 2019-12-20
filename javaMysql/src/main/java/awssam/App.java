package awssam;

import awssam.request.Request;
import awssam.response.GatewayResponse;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<JSONObject, GatewayResponse> {

  private Connection conn;
  private Statement stmt;
  private ResultSet resultSet;

  public GatewayResponse handleRequest(final JSONObject input, final Context context) {
    LambdaLogger logger = context.getLogger();
    logger.log("\n\nContents of Input: " + input.toString() + "\n\n");

    ObjectMapper mapper = new ObjectMapper();
    List<String> names = new ArrayList<>();
    JSONObject response = new JSONObject();

    try {
      Request request = mapper.readValue(input.get("body").toString(), Request.class);
      logger.log("\n\nContents of Request: " + request.toString() + "\n\n");

      logger.log("\n\nConnecting to DB...");
      conn = createConnection();
      stmt = conn.createStatement();
      resultSet = stmt.executeQuery("SELECT * FROM Users.user");

      while (resultSet.next()) {
        String current = resultSet.getString("username");
        names.add(current);
      }

      logger.log("\n\nSuccessfully executed query.  Result: " + names.toString());

      response.put("message", "Hello " + request.getFirstname() + " " + request.getLastname() + "! Users are: " + names.toString());

      return new GatewayResponse(200, response.toJSONString());

    } catch (Exception e) {
      logger.log("Caught exception: " + e.getMessage());
      return new GatewayResponse(200, e.getMessage());
    } finally {
      try {
        resultSet.close();
        stmt.close();
        conn.close();
      } catch (SQLException e) {
        logger.log("Caught exception when trying to close: " + e.getMessage());
      }
    }
  }

  private Connection createConnection() throws SQLException {
    String dbHost = System.getenv("DB_HOST");
    String dbUser = System.getenv("DB_USER");
    String dbPass = System.getenv("DB_PASS");
    String dbPort = System.getenv("DB_PORT");
    String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "?useSSL=false";
    return DriverManager.getConnection(url, dbUser, dbPass);
  }

}
