package se.sbab.sqsNotifier.service;

import com.amazonaws.services.lambda.invoke.LambdaFunction;
import se.sbab.sqsNotifier.api.model.RequestModel;

import java.util.List;

public interface LambdaService {
    @LambdaFunction(functionName = "lambda-receive-sqs")
    List<RequestModel> receiveSqsMessage();
}
