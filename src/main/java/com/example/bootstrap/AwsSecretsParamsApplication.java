package com.example.bootstrap;

import com.example.bootstrap.entity.UserEntity;
import com.example.bootstrap.entity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class AwsSecretsParamsApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Environment environment;

    // Secret Manager
    @Value("${db.password}")
    private String dbPassword;

    // Secret Manager
    @Value("${db.url}")
    private String dbUrl;

    // Secret Manager
    @Value("${db.username}")
    private String dbUsername;

    // application.yml
    @Value("${test.db.url}")
    private String testDbUrl;
    // application.yml
    @Value("${test.db.username}")
    private String testDbUsername;
    @Value("${test.db.password}")
    private String testDbPassword;

    // Parameter store
    @Value("${app.token}")
    private String appToken;

    // application.yml -> Parameter store
    @Value("${app.config.token}")
    private String appConfigToken;

    public static void main(String[] args) {
        SpringApplication.run(AwsSecretsParamsApplication.class, args);
    }

    @Override
    public void run(String... args) {
        System.out.println("DB URL resolved from Secrets Manager - env.getprop: " + environment.getProperty("db.url"));
        System.out.println("DB URL resolved from Secrets Manager - @value: " + dbUrl);
        System.out.println("DB Username resolved from Secrets Manager - env.getprop: " + environment.getProperty("db.username"));
        System.out.println("DB Username resolved from Secrets Manager - @value: " + dbUsername);
        System.out.println("DB Password resolved from Secrets Manager - env.getprop: " + environment.getProperty("db.password"));
        System.out.println("DB Password resolved from Secrets Manager - @value: " + dbPassword);

        System.out.println("----------------------------------------------------------");
        System.out.println("TEST DB URL resolved from application.yml - @value: " + testDbUrl);
        System.out.println("TEST DB Username resolved from application.yml - @value: " + testDbUsername);
        System.out.println("TEST DB Password resolved from application.yml - @value: " + testDbPassword);


        System.out.println("----------------------------------------------------------");
        System.out.println("Param Store App Token - env.getprop: " + environment.getProperty("app.token"));
        System.out.println("Param Store App Token - 2env.getprop: " + environment.getProperty("app.config.token"));
        System.out.println("Param Store App Token - @Value: " + appToken);
        System.out.println("Param Store - application.yml - @Value: " + appConfigToken);

        userRepository.save(new UserEntity("Test", "Test"));
        userRepository.findAll()
            .forEach(u -> System.out.println(u.toString()));
    }

}
