package com.example.awsspring;

import com.example.awsspring.service.BucketService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@RunWith(SpringRunner.class)
@AutoConfigureMockMvc
@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
public class AwsSpringApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BucketService service;

    @Autowired
    private WebApplicationContext context;

    @Before
    public void setup() {
        initMocks(this);
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        // TODO: Should we mock all S3 get objects in the service?
        //when(service.getS3Bucket()).thenReturn(mock(AmazonS3.class));
    }

    @Test
    public void getBucketNames() throws Exception {

        // Given
        when(service.getBucketContentNames(anyString())).thenReturn(Collections.singletonList("bName"));

        mockMvc.perform(get("/v1"))
                .andDo(print());
    }
}
