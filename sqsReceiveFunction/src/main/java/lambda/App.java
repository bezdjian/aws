package lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.GetQueueUrlRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<Object, GatewayResponse> {

    public GatewayResponse handleRequest(final Object input, final Context context) {
        LambdaLogger log = context.getLogger();

        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
        GetQueueUrlRequest urlRequest = new GetQueueUrlRequest("SbabQueue.fifo");
        String queueUrl = sqs.getQueueUrl(urlRequest).getQueueUrl();

        List<String> body = new ArrayList<>();
        AtomicReference<String> receiptHandle = new AtomicReference<>();
        try {
            // Receive messages.
            log.log("Receiving messages from queue.\n");
            final ReceiveMessageRequest receiveMessageRequest =
                    new ReceiveMessageRequest().
                            withQueueUrl(queueUrl);
            //.withMaxNumberOfMessages(10);

            final List<Message> messages = sqs.receiveMessage(receiveMessageRequest)
                    .getMessages();

            log.log("Got " + messages.size() + " messages \n");
            if (!messages.isEmpty()) {
                messages.forEach(message -> {
                    log.log("  MessageId: " + message.getMessageId() + "\n");
                    log.log("  Body:          " + message.getBody() + "\n");
                    body.add(message.getBody());
                    receiptHandle.set(message.getReceiptHandle());
                });

                // Delete the message
                log.log("Deleting the message.\n");
                sqs.deleteMessage(new DeleteMessageRequest(queueUrl, receiptHandle.get()));
                return new GatewayResponse(body.toString(), 200);
            }
            return new GatewayResponse("No messages received", 200);

        } catch (Exception e) {
            return new GatewayResponse(e.getMessage(), 500);
        }
    }
}
