package com.myorg;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;
import software.amazon.awscdk.core.App;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class CdkJavaTest {
    private final static ObjectMapper JSON =
        new ObjectMapper().configure(SerializationFeature.INDENT_OUTPUT, true);

    @Test
    void testStack() throws IOException {
        App app = new App();
        CdkJavaStack stack = new CdkJavaStack(app, "test");

        // synthesize the stack to a CloudFormation template and compare against
        // a checked-in JSON file.
        JsonNode actual = JSON.valueToTree(app.synth().getStackArtifact(stack.getArtifactId()).getTemplate());

        assertThat(new ObjectMapper().createObjectNode()).isEqualTo(actual);
    }
}
