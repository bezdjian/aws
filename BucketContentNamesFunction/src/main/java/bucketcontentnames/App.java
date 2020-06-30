package bucketcontentnames;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpStatus;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<Object, GatewayResponse> {

    public GatewayResponse handleRequest(Object input, Context context) {
        LambdaLogger log = context.getLogger();
        Map<String, String> headers = new HashMap<>();
        JSONObject response = new JSONObject();
        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        try {
            String bucketName = getQueryParam(input);

            ListObjectsV2Request request = new ListObjectsV2Request().withBucketName(bucketName);
            AmazonS3 s3 = getS3Bucket();
            ListObjectsV2Result result = s3.listObjectsV2(request);
            log.log("\n***** Got the S3 bucket: " + bucketName + " from " + s3.getRegionName());

            do {
                result.getObjectSummaries()
                        .forEach(o -> response.put(o.getKey(), o.getSize() / 1024));
            } while (result.isTruncated());

            log.log("\n***** List with content names is generated");
            return new GatewayResponse(String.valueOf(response), headers, HttpStatus.SC_OK);
        } catch (Exception e) {
            return new GatewayResponse("{'error': '" + e.getMessage() + "'}",
                    headers, HttpStatus.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private String getQueryParam(Object input) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writeValueAsString(input);
        JSONObject jsonObject = new JSONObject(jsonString);
        return jsonObject.getJSONObject("queryStringParameters").getString("bucketName");
    }

    protected AmazonS3 getS3Bucket() {
        return AmazonS3ClientBuilder.defaultClient();
    }
}
