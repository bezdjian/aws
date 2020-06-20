package se.sbab.sqsnotifier;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.util.AssertionErrors.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LambdaApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    // @Test
    void hello() throws Exception {
        MvcResult result = mockMvc.perform(get("/api"))
                .andExpect(status().is2xxSuccessful())
                .andDo(print())
                .andReturn();

        assertEquals("Result is wrong", "Hello!", result.getResponse().getContentAsString());
    }

}
