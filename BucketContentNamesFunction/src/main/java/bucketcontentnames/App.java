package bucketcontentnames;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import org.apache.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        LambdaLogger logger = context.getLogger();
        Map<String, String> headers = new HashMap<>();
        Map<String, Long> response = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        APIGatewayProxyResponseEvent apiResponse = new APIGatewayProxyResponseEvent()
                .withHeaders(headers);
        try {
            String bucketName = input.getQueryStringParameters().get("bucketName") != null ?
                    input.getQueryStringParameters().get("bucketName") : "";

            ListObjectsV2Request request = new ListObjectsV2Request().withBucketName(bucketName);
            AmazonS3 s3 = getS3Bucket();
            ListObjectsV2Result result = s3.listObjectsV2(request);
            logger.log("\n***** Got the S3 bucket: " + bucketName + " from " + s3.getRegionName());

            do {
                result.getObjectSummaries()
                        .forEach(o -> response.put(o.getKey(), o.getSize() / 1024));
            } while (result.isTruncated());

            logger.log("\n***** List with content names is generated.\n\n");
            return apiResponse
                    .withStatusCode(HttpStatus.SC_OK)
                    .withBody(String.valueOf(response));
        } catch (Exception e) {
            logger.log("\n***** Error while getting the contents: " + e.getMessage() + "\n\n");
            return apiResponse
                    .withBody("{'error': '" + e.getMessage() + "'}")
                    .withStatusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        }
    }

    protected AmazonS3 getS3Bucket() {
        return AmazonS3ClientBuilder.defaultClient();
    }
}
