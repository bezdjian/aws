package bucketcontentnames;

import org.junit.Ignore;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class AppTest {
    @Test
    @Ignore
    public void successfulResponse() {
        App app = new App();
        GatewayResponse result = (GatewayResponse) app.handleRequest(null, null);
        assertEquals(result.getStatusCode(), 200);
        List<String> content = result.getBody();
        assertNotNull(content);
        assertTrue(content.contains("\"message\""));
        assertTrue(content.contains("\"hello world\""));
        assertTrue(content.contains("\"location\""));
    }
}
