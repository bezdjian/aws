package com.myorg;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;
import software.amazon.awscdk.core.App;

import static org.assertj.core.api.Assertions.assertThat;

class CdkJavaTest {
    private final static ObjectMapper JSON =
        new ObjectMapper().configure(SerializationFeature.INDENT_OUTPUT, true);

    @Test
    void testStack() {
        App app = new App();
        //CdkJavaMainStack mainStack = new CdkJavaMainStack(app, "mainStack");
        CdkJavaServerlessStack stack = new CdkJavaServerlessStack(app, "mainStack");

        // synthesize the stack to a CloudFormation template and compare against
        // a checked-in JSON file.
        JsonNode actual = JSON.valueToTree(app.synth().getStackArtifact(stack.getArtifactId()).getTemplate());

        assertThat(new ObjectMapper().createObjectNode()).isEqualTo(actual);
    }
}
