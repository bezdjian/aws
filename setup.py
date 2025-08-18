import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="step_functions",
    version="0.0.1",

    description="AWS CDK Python app to create infrustructure for step functions with Lambdas",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="author",

    package_dir={"": "step_functions"},
    packages=setuptools.find_packages(where="step_functions"),

    install_requires=[
        "aws-cdk-lib>=2.211.0",
        "constructs>=10.0.0",
        "boto3>=1.34.0",
        "botocore>=1.34.0",
    ],

    install_requires=[
        "aws-cdk-lib>=2.130.0",
        "constructs>=10.0.0",
        "boto3>=1.34.0",
        "botocore>=1.34.0",
        "pytest"
    ],

    python_requires=">=3.6",

    classifiers=[
        "Development Status :: 4 - Beta",

        "Intended Audience :: Developers",

        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.13",

        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",

        "Typing :: Typed",
    ],
)
