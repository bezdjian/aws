package se.sbab.sqsNotifier.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Headers {
    private String Host;
    @JsonProperty("User-Agent")
    private String UserAgent;
    @JsonProperty("Content-type")
    private String ContentType;
    @JsonProperty("Authorization")
    private String Authorization;
    private String Accept;
    @JsonProperty("Content-Length")
    private String ContentLength;
    @JsonProperty("X-Forwarded-Proto")
    private String XForwardedProto;
    @JsonProperty("X-Forwarded-Port")
    private String XForwardedPort;
}
