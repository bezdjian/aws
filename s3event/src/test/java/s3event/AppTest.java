package s3event;

import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.dynamodbv2.model.PutItemResult;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
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
    String tableName = "sas-token-cache-outbound";
    List<String> newItemLabels = new ArrayList<>();
    InputStream resource = getClass().getClassLoader().getResourceAsStream("test.csv");
    assert resource != null;
    try {
      final List<WhiteList> whiteList = MapCsvLinesToWhiteList(resource);
      final AmazonDynamoDB dynamoDbClient = getDynamoDbClient();

      whiteList.forEach(wl -> {
        System.out.println("Putting item..." + wl.toMap());
        PutItemResult putItemResult = dynamoDbClient.putItem(new PutItemRequest(tableName, wl.toAttributeValueMap())
            .withReturnValues(ReturnValue.ALL_OLD));
        String newItemLabel = putItemResult.getAttributes() != null ? "OLD" : "NEW";
        System.out.println("PutItemResult: " + putItemResult);
        System.out.println("newItemLabel: " + newItemLabel);
        newItemLabels.add(newItemLabel);
      });

      long newItemCount = newItemLabels.stream()
          .filter(l -> l.equals("NEW"))
          .count();
      System.out.println("New Items: " + newItemCount);
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  private List<WhiteList> MapCsvLinesToWhiteList(InputStream resource) throws IOException {
    List<WhiteList> whiteListList = new ArrayList<>();
    try (BufferedReader br = new BufferedReader(new InputStreamReader(resource, StandardCharsets.UTF_8))) {
      String line;
      while ((line = br.readLine()) != null) {
        String[] values = line.split(",");
        WhiteList whiteList = new WhiteList(values);
        whiteListList.add(whiteList);
      }
    }
    return whiteListList;
  }

  private AmazonDynamoDB getDynamoDbClient() {
    EndpointConfiguration endpointConfiguration =
        new EndpointConfiguration("http://localhost.localstack.cloud:4566", "eu-west-1");

    return AmazonDynamoDBClientBuilder.standard()
        .withEndpointConfiguration(endpointConfiguration)
        .build();
  }
}
