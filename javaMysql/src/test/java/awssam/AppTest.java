package awssam;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import org.junit.Before;
import org.mockito.Mock;

import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class AppTest {

  @Mock
  private Context context;
  @Mock
  private LambdaLogger logger;

  @Before
  public void setup() {
    initMocks(this);
    when(context.getLogger()).thenReturn(logger);
  }
  // TODO: Write tests
  /*
  @Test
  public void successfulResponse() {
    App app = new App();
    GatewayResponse result = app.handleRequest(testEvent(), context);
    assertEquals(result.getStatusCode(), 200);
    String content = result.getBody();
    assertNotNull(content);
  }

   */
}
