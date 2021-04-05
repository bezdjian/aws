package com.myorg;

import software.amazon.awscdk.core.App;

public class CdkJavaApp {

    public static void main(final String[] args) {
        App app = new App();
        app.synth();
    }
}