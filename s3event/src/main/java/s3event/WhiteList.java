package s3event;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;

import java.util.Map;

public class WhiteList {

  private String clientId;
  private String scope;
  private String service;
  private String tenant;

  public WhiteList(String[] csvLine) {
    this.clientId = csvLine[0];
    this.scope = csvLine[1];
    this.service = csvLine[2];
    this.tenant = csvLine[3];
  }

  public Map<String, Object> toMap() {
    return Map.of("clientid", clientId, "scope", scope, "service", service, "tenant", tenant);
  }

  public Map<String, AttributeValue> toAttributeValueMap() {
    return Map.of("clientid", new AttributeValue(clientId),
        "scope", new AttributeValue(scope),
        "service", new AttributeValue(service),
        "tenant", new AttributeValue(tenant));
  }

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getScope() {
    return scope;
  }

  public void setScope(String scope) {
    this.scope = scope;
  }

  public String getService() {
    return service;
  }

  public void setService(String service) {
    this.service = service;
  }

  public String getTenant() {
    return tenant;
  }

  public void setTenant(String tenant) {
    this.tenant = tenant;
  }

  @Override
  public String toString() {
    return "{" +
        "clientId='" + clientId + '\'' +
        ", scope='" + scope + '\'' +
        ", service='" + service + '\'' +
        ", tenant='" + tenant + '\'' +
        '}';
  }
}
