package s3event;

import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.dynamodbv2.model.PutItemResult;
import org.junit.Ignore;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class AppTest {

  /*
   * This is not a unit test per se, it will test against localstack instead of running the Lambda function.
   * This test will read the test.csv from test/resources folder and insert into dynamo locally.
   */
  @Test
  @Ignore
  public void s() {

    List<WhiteList> whiteListList = new ArrayList<>();
    InputStream resource = getClass().getClassLoader().getResourceAsStream("test.csv");
    assert resource != null;
    try (BufferedReader br = new BufferedReader(new InputStreamReader(resource, StandardCharsets.UTF_8))) {
      String line;
      while ((line = br.readLine()) != null) {
        String[] values = line.split(",");
        WhiteList whiteList = new WhiteList(values);
        whiteListList.add(whiteList);
      }

      whiteListList.forEach(System.out::println);

      final AmazonDynamoDB dynamoDbClient = getDynamoDbClient();
      final DynamoDB dynamoDB = new DynamoDB(dynamoDbClient);
      final Table table = dynamoDB.getTable("sas-token-cache-outbound");

      whiteListList.forEach(wl -> {
        System.out.println("\n Putting item..." + wl.toMap());
        PutItemResult putItemResult = dynamoDbClient.putItem(new PutItemRequest(table.getTableName(), wl.toAttributeValueMap()));
        System.out.println("\n PutItemResult: " + putItemResult.toString());
      });
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  private AmazonDynamoDB getDynamoDbClient() {
    EndpointConfiguration endpointConfiguration =
        new EndpointConfiguration("http://localhost.localstack.cloud:4566", "eu-west-1");

    return AmazonDynamoDBClientBuilder.standard()
        .withEndpointConfiguration(endpointConfiguration)
        .build();
  }
}
