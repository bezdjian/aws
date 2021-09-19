from aws_cdk import (
    core as cdk,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as sf_task,
    aws_dynamodb as db
)

from step_functions.constructs.transaction_functions import TransactionFunctions


class StepFunctionsStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Dynamo DB - HistoryTable
        history_table = db.Table(self, "HistoryTable",
                                 table_name="HistoryTable",
                                 billing_mode=db.BillingMode.PAY_PER_REQUEST,
                                 partition_key=db.Attribute(
                                     name="id",
                                     type=db.AttributeType.STRING))

        transaction_functions = TransactionFunctions(self, "TransactionFunctions")

        submit_transaction = sf_task.RunLambdaTask(lambda_function=transaction_functions.submit_function,
                                                   payload=sfn.TaskInput.from_data_at("$"))

        order_transaction = sf_task.RunLambdaTask(lambda_function=transaction_functions.order_function,
                                                  payload=sfn.TaskInput.from_data_at("$"))

        cancel_transaction = sf_task.RunLambdaTask(lambda_function=transaction_functions.cancel_function,
                                                   payload=sfn.TaskInput.from_data_at("$"))

        submit_job_task = sfn.Task(self, "SubmitTransactionTask", task=submit_transaction,
                                   # Send output starting from Payload, which makes it look like
                                   # {body: status: ORDER}
                                   output_path="$.Payload")
        order_job_task = sfn.Task(self, "OrderTransactionTask", task=order_transaction,
                                  # Send output starting from Payload
                                  output_path="$.Payload")
        cancel_job_task = sfn.Task(self, "CancelTransactionTask", task=cancel_transaction,
                                   # Send output starting from Payload
                                   output_path="$.Payload")

        succeed = sfn.Succeed(self, "Success", input_path="$")
        submit_fail = sfn.Fail(self, "SubmitFail", error="Transaction error", cause="Transaction Type us unknown")
        transaction_fail = sfn.Fail(self, "TransactionError", error="Transaction error",
                                    cause="Error occurred while processing transaction")

        order_status = self.create_order_status_choices(succeed, transaction_fail)
        order_job_task.next(order_status)

        cancel_status = self.create_cancel_status_choices(succeed, transaction_fail)
        cancel_job_task.next(cancel_status)

        transaction_status = self.create_transaction_status_choices(cancel_job_task, order_job_task, submit_fail)
        definition = submit_job_task.next(transaction_status)

        state_machine = sfn.StateMachine(self, "SimpleStateMachine",
                                         definition=definition,
                                         state_machine_name="StateMachine-SimpleResult")

        self.set_environment_variables(state_machine, transaction_functions, history_table.table_name)

        # Grant start_function to execute state machine
        state_machine.grant_start_execution(transaction_functions.start_function)

        cdk.CfnOutput(self, "StateMachineName",
                      export_name="StateMachineName",
                      value=state_machine.state_machine_name)

        cdk.CfnOutput(self, "HistoryTableName",
                      export_name="HistoryTableName",
                      value=history_table.table_name)

    def set_environment_variables(self, state_machine, transaction_functions, table_name):
        transaction_functions.start_function.add_environment("state_machine_arn", state_machine.state_machine_arn)
        transaction_functions.start_function.add_environment("state_machine_name", state_machine.state_machine_name)
        transaction_functions.start_function.add_environment("test", "false")
        transaction_functions.start_function.add_environment("history_table", table_name)
        transaction_functions.submit_function.add_environment("history_table", table_name)

    def create_transaction_status_choices(self, cancel_job_task, order_job_task, submit_fail):
        return sfn.Choice(self, 'TransactionStatus') \
            .when(sfn.Condition.string_equals('$.body.status', 'ORDER'), order_job_task) \
            .when(sfn.Condition.string_equals('$.body.status', 'CANCEL'), cancel_job_task) \
            .when(sfn.Condition.string_equals("$.body.status", "NONE"), submit_fail)

    def create_order_status_choices(self, succeed, transaction_fail):
        return sfn.Choice(self, "OrderStatus") \
            .when(sfn.Condition.string_equals("$", "COMPLETED"), succeed) \
            .when(sfn.Condition.string_equals("$.body.status", "ERROR"), transaction_fail)

    def create_cancel_status_choices(self, succeed, transaction_fail):
        return sfn.Choice(self, "CancelStatus") \
            .when(sfn.Condition.string_equals("$", "CANCELLED"), succeed) \
            .when(sfn.Condition.string_equals("$.body.status", "ERROR"), transaction_fail)
