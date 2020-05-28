package se.sbab.sqsNotifier.api.model;

import lombok.Data;

@Data
public class Identity {

    private String apiKey;
    private String userArn;
    private String cognitoAuthenticationType;
    private String caller;
    private String userAgent;
    private String user;
    private String cognitoIdentityPoolId;
    private String cognitoAuthenticationProvider;
    private String sourceIp;
    private String accountId;
}
