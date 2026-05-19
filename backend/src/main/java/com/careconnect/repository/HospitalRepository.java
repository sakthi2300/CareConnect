package com.careconnect.repository;

import com.careconnect.entity.Hospital;
import com.careconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByUser(User user);
}

