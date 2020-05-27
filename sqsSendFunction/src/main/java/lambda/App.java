package lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.CreateQueueRequest;
import com.amazonaws.services.sqs.model.SendMessageRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<Object, GatewayResponse> {

    public GatewayResponse handleRequest(final Object input, final Context context) {
        LambdaLogger log = context.getLogger();

        log.log("Input: " + input.toString() + "\n");
        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();

        log.log("Creating SQS \n");
        final Map<String, String> attributes = new HashMap<>();
        // A FIFO queue must have the FifoQueue attribute set to true.
        attributes.put("FifoQueue", "true");
        /*
         * If the user doesn't provide a MessageDeduplicationId, generate a
         * MessageDeduplicationId based on the content.
         */
        attributes.put("ContentBasedDeduplication", "true");
        try {
            CreateQueueRequest createQueueRequest = new CreateQueueRequest("SbabQueue.fifo")
                    .withAttributes(attributes);
            String queueUrl = sqs.createQueue(createQueueRequest).getQueueUrl();
            log.log("SQS Queue url: " + queueUrl + "\n");

            SendMessageRequest sendMessageRequest = new SendMessageRequest(queueUrl, input.toString());
            sendMessageRequest.setMessageGroupId("sbabGroup");
            //Puts msgs only once: sendMessageRequest.setMessageDeduplicationId("1");
            sqs.sendMessage(sendMessageRequest);

            return new GatewayResponse("Message sent!", 200);
        } catch (Exception e) {
            return new GatewayResponse(e.getMessage(), 500);
        }
    }
}
