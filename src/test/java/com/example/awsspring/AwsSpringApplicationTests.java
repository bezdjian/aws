package com.example.awsspring;

import com.example.awsspring.entity.User;
import com.example.awsspring.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AwsSpringApplication.class)
@AutoConfigureMockMvc
class AwsSpringApplicationTests {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UserService userService;

    @Test
    @DisplayName("Find all users")
    void allUsers() throws Exception {
        //Given
        when(userService.getUsers()).thenReturn(Collections.singletonList(User.builder()
                .firstname("first")
                .build()));
        mockMvc.perform(get("/v1/users"))
                .andDo(print())
                .andExpect(status().is2xxSuccessful());
    }
}
