package se.sbab.sqsNotifier.api.model;

import lombok.Data;

@Data
public class RequestContext {
    private String resourceId;
    private String apiId;
    private String resourcePath;
    private String httpMethod;
    private String requestId;
    private String accountId;
    private String stage;
    private Identity identity;
    private String extendedRequestId;
    private String path;
}
