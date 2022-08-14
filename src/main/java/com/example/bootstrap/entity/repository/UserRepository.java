package com.example.bootstrap.entity.repository;

import com.example.bootstrap.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
