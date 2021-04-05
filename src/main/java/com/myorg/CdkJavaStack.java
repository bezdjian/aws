package com.myorg;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;

public class CdkJavaStack extends Stack {
    public CdkJavaStack(final Construct scope, final String id) {
        super(scope, id);
    }

    public CdkJavaStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);
    }
}
