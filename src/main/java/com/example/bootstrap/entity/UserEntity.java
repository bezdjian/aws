package com.example.bootstrap.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;

@Getter
@Setter
@Entity
@ToString
@NoArgsConstructor
@Table(name = "SPRING_USER")
public class UserEntity {
    @Id
    @GeneratedValue
    @Column
    private Long id;

    @Column
    private String firstname;

    @Column
    private String lastname;

    public UserEntity(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }
}
