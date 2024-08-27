import boto3
import json

bedrock = boto3.client(service_name='bedrock-runtime', region_name='eu-west-3')

# Each model has different input format
body = json.dumps({
    'inputText': 'How can you become a great software engineer?',
    'textGenerationConfig': {
        "maxTokenCount": 300,
        "stopSequences": [],
        "temperature": 0.7,
        "topP": 0.9
    }
})

# Get the model id from here https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
model_id = 'amazon.titan-text-lite-v1'

response = bedrock.invoke_model(body=body, modelId=model_id)
response_body = json.loads(response.get('body').read())

# print(f"Response: {response}")
# print(response_body)
print(response_body["results"][0]["outputText"])
