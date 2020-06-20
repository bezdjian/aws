package se.sbab.sqsnotifier.service;

import com.amazonaws.services.lambda.invoke.LambdaFunction;
import se.sbab.sqsnotifier.api.model.RequestModel;

import java.util.List;

public interface LambdaService {
    @LambdaFunction(functionName = "lambda-receive-sqs")
    List<RequestModel> receiveSqsMessage();
}
