# Build stage
#FROM maven:3-jdk-11-slim AS build

#COPY src /home/app/src
#COPY pom.xml /home/app
#WORKDIR /home/app
#RUN mvn clean package

# Package stage
FROM openjdk:17-jdk-slim
COPY target/product-api-0.0.1.jar /usr/local/lib/product-api.jar

EXPOSE 80
ENTRYPOINT ["java", "-jar", "/usr/local/lib/product-api.jar"]