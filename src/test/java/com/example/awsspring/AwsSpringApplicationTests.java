package com.example.awsspring;

import com.example.awsspring.service.BucketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@AutoConfigureMockMvc
@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
class AwsSpringApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BucketService service;

    @BeforeEach
    public void setup() {
        initMocks(this);
    }

    @Test
    void getBucketNames() throws Exception {
        // Given
        when(service.getBucketContentNames(anyString())).thenReturn(Collections.singletonList("bName"));

        mockMvc.perform(get("/v1"))
                .andDo(print());
    }
}
