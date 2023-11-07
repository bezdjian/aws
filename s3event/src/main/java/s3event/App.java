package s3event;

import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.lambda.runtime.events.models.s3.S3EventNotification.S3EventNotificationRecord;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class App implements RequestHandler<S3Event, String> {

  public String handleRequest(final S3Event s3Event, final Context context) {
    LambdaLogger logger = context.getLogger();
    S3EventNotificationRecord record = s3Event.getRecords().get(0);

    String bkt = record.getS3().getBucket().getName();
    String key = record.getS3().getObject().getKey();
    String region = System.getenv("REGION");
    String tableName = System.getenv("TABLE_NAME");
    String localstackEndpoint = System.getenv("LOCAL_STACK_ENDPOINT");
    String s3LocalStackEndpoint = System.getenv("S3_LOCAL_STACK_ENDPOINT");

    logger.log("\nBucketName: " + bkt);
    logger.log("\nKey: " + key);
    logger.log("\nRegion: " + region);

    final AmazonS3 s3Client = getS3Client(s3LocalStackEndpoint, region);
    final S3Object s3Object = s3Client.getObject(bkt, key);
    final List<WhiteList> whiteListList = extractLinesFromCsv(s3Object.getObjectContent());

    logger.log("\n\n");
    whiteListList.forEach(System.out::println);

    // Code to insert into AWS Dynamo db
    final AmazonDynamoDB dynamoDbClient = getDynamoDbClient(localstackEndpoint, region);
    final DynamoDB dynamoDB = new DynamoDB(dynamoDbClient);
    final Table table = dynamoDB.getTable(tableName);

    whiteListList.forEach(wl -> table.putItem(Item.fromMap(wl.toMap())));

    return "OK";
  }

  private AmazonS3 getS3Client(String s3LocalStackEndpoint, String region) {
    return AmazonS3ClientBuilder.standard()
        .withEndpointConfiguration(new EndpointConfiguration(s3LocalStackEndpoint, region))
        .build();
  }

  private AmazonDynamoDB getDynamoDbClient(String localstackEndpoint, String region) {
    return AmazonDynamoDBClientBuilder.standard()
        .withEndpointConfiguration(new EndpointConfiguration(localstackEndpoint, region))
        .build();
  }

  private List<WhiteList> extractLinesFromCsv(S3ObjectInputStream objectContent) {
    List<WhiteList> whiteListList = new ArrayList<>();
    try (BufferedReader br = new BufferedReader(new InputStreamReader(objectContent, StandardCharsets.UTF_8))) {
      String line;
      while ((line = br.readLine()) != null) {
        whiteListList.add(buildWhiteListObject(line));
      }
      return whiteListList;
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  private WhiteList buildWhiteListObject(String csvLine) {
    String[] values = csvLine.split(",");
    return new WhiteList(values);
  }
}
