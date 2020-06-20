package se.sbab.sqsNotifier.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestModel {
    private String httpMethod;
    private String body;
    private String resource; //=/send,
    private RequestContext requestContext;
    private Map<String, String> queryStringParameters;
    private Headers headers;
    private String pathParameters;
    private String stageVariables;
    private String path; ///send,
    private Boolean isBase64Encoded;

}
