FROM maven

COPY src /app/src
COPY pom.xml /app/

WORKDIR /app

RUN mvn install -DskipTests

RUN cp /app/target/demo-0.1.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

## Simple Dockerfile
#FROM openjdk:17-jdk
#COPY /target/demo-0.1.jar app.jar
#EXPOSE 8081
#ENTRYPOINT ["java", "-jar", "app.jar"]
