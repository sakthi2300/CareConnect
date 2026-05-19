package com.careconnect.controller;

import com.careconnect.dto.AuthDtos;
import com.careconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/hospital")
    public ResponseEntity<AuthDtos.JwtResponse> registerHospital(
            @Valid @RequestBody AuthDtos.RegisterHospitalRequest request) {
        return ResponseEntity.ok(authService.registerHospital(request));
    }

    @PostMapping("/register/staff")
    public ResponseEntity<AuthDtos.JwtResponse> registerStaff(
            @Valid @RequestBody AuthDtos.RegisterStaffRequest request) {
        return ResponseEntity.ok(authService.registerStaff(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.JwtResponse> login(
            @Valid @RequestBody AuthDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

