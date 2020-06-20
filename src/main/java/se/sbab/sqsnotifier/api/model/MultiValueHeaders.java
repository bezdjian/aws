package se.sbab.sqsnotifier.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class MultiValueHeaders {
    private List<List<String>> Host;
    @JsonProperty("User-Agent")
    private List<String> UserAgent;
    @JsonProperty("Content-Type")
    private List<String> ContentType;
    private List<String> Authorization;
    private List<String> Accept;
    @JsonProperty("Content-Length")
    private List<String> ContentLength;
    @JsonProperty("X-Forwarded-Proto")
    private List<String> XForwardedProto;
    @JsonProperty("X-Forwarded-Port")
    private List<String> XForwardedPort;
}
