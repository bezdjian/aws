from aws_cdk import (
    core as cdk,
    aws_lambda as lmb,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as sf_task,
    aws_apigateway as api,
)


class StepFunctionsStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Lambda function triggered by API Gateway to read the input, do some logic and start the state machine.
        start_function = lmb.Function(self, "StartTransactionFunction",
                                      code=lmb.Code.from_asset("function/start"),
                                      runtime=lmb.Runtime.PYTHON_3_8,
                                      handler="start.handler",
                                      function_name="StepFunction-StartTransaction")

        # Lambda function that reads the input from start_function and submits
        submit_function = lmb.Function(self, "SubmitTransactionFunction",
                                       code=lmb.Code.from_asset("function/submit"),
                                       runtime=lmb.Runtime.PYTHON_3_8,
                                       handler="submit.handler",
                                       function_name="StepFunction-SubmitTransaction")

        # Lambda function that processes the order if the step function's transactionType = "ORDER"
        order_function = lmb.Function(self, "OrderFunction",
                                      code=lmb.Code.from_asset("function/order"),
                                      runtime=lmb.Runtime.PYTHON_3_8,
                                      handler="order.handler",
                                      function_name="StepFunction-Order")

        # Lambda function that processes the order if the step function's transactionType = "CANCEL"
        cancel_function = lmb.Function(self, "CancelFunction",
                                       code=lmb.Code.from_asset("function/cancel"),
                                       runtime=lmb.Runtime.PYTHON_3_8,
                                       handler="cancel.handler",
                                       function_name="StepFunction-Cancel")

        # Lambda task for submit function
        submit_transaction = sf_task.RunLambdaTask(lambda_function=submit_function,
                                                   payload=sfn.TaskInput.from_data_at("$"))
        # Lambda task for order function
        order_transaction = sf_task.RunLambdaTask(lambda_function=order_function,
                                                  payload=sfn.TaskInput.from_data_at("$"))
        # Lambda task for cancel function
        cancel_transaction = sf_task.RunLambdaTask(lambda_function=cancel_function,
                                                   payload=sfn.TaskInput.from_data_at("$"))
        # State machine Task for submit function
        submit_job_task = sfn.Task(self, "SubmitTransactionTask", task=submit_transaction,
                                   # Send output starting from Payload, which makes it look like
                                   # {body: status: ORDER}
                                   output_path="$.Payload")
        # State machine Task for order function
        order_job_task = sfn.Task(self, "OrderTransactionTask", task=order_transaction,
                                  # Send output starting from Payload
                                  output_path="$.Payload")
        # State machine Task for cancel function
        cancel_job_task = sfn.Task(self, "CancelTransactionTask", task=cancel_transaction,
                                   # Send output starting from Payload
                                   output_path="$.Payload")

        # five_seconds = cdk.Duration.seconds(5)
        # waiting_time = sfn.Wait(self, 'Wait 5 Seconds',
        #                        time=sfn.WaitTime.duration(duration=five_seconds))

        succeed = sfn.Succeed(self, "Success", input_path="$")
        submit_fail = sfn.Fail(self, "SubmitFail",
                               error="Transaction error",
                               cause="Transaction Type us unknown")
        transaction_fail = sfn.Fail(self, "TransactionError",
                                    error="Transaction error",
                                    cause="Error occurred while processing transaction")

        # State machine Choice for order
        order_status = sfn.Choice(self, "OrderStatus") \
            .when(sfn.Condition.string_equals("$", "COMPLETED"), succeed) \
            .when(sfn.Condition.string_equals("$.body.status", "ERROR"), transaction_fail)
        order_job_task.next(order_status)

        cancel_status = sfn.Choice(self, "CancelStatus") \
            .when(sfn.Condition.string_equals("$", "CANCELLED"), succeed) \
            .when(sfn.Condition.string_equals("$.body.status", "ERROR"), transaction_fail)
        cancel_job_task.next(cancel_status)

        transaction_status = sfn.Choice(self, 'TransactionStatus') \
            .when(sfn.Condition.string_equals('$.body.status', 'ORDER'), order_job_task) \
            .when(sfn.Condition.string_equals('$.body.status', 'CANCEL'), cancel_job_task) \
            .when(sfn.Condition.string_equals("$.body.status", "NONE"), submit_fail)

        definition = submit_job_task.next(transaction_status)

        state_machine = sfn.StateMachine(self, "SimpleStateMachine",
                                         definition=definition,
                                         state_machine_name="StateMachine-SimpleResult")

        start_function.add_environment("state_machine_arn", state_machine.state_machine_arn)
        start_function.add_environment("state_machine_name", state_machine.state_machine_name)

        # Grant start_function to execute state machine
        state_machine.grant_start_execution(start_function)

        request_templates = {
            "application/json": '{ "statusCode": "200" }'
        }
        sf_integration = api.LambdaIntegration(start_function, request_templates=request_templates)
        execution_api = api.RestApi(self, "StartExecutionAPI",
                                    rest_api_name="StartExecutionAPI")

        execution_api.root.add_resource("execute").add_method("POST", sf_integration)

        cdk.CfnOutput(self, "StateMachineName",
                      export_name="StateMachineName",
                      value=state_machine.state_machine_name)

        cdk.CfnOutput(self, "StartExecutionAPI-URL",
                      export_name="StartExecutionAPI-URL",
                      value=execution_api.url)

        # start_execution = sf_task.StepFunctionsStartExecution(self, "StartStepFunctionExecution",
        #                                                       state_machine=state_machine,
        #                                                       input=state_machine_input,
        #                                                       name="TransactionFunctionsExecutor",
        #                                                       input_path="$",
        #                                                       output_path="$.Payload")
