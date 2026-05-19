package com.careconnect.service;

import com.careconnect.dto.AuthDtos;
import com.careconnect.entity.Hospital;
import com.careconnect.entity.MedicalStaff;
import com.careconnect.entity.Role;
import com.careconnect.entity.StaffType;
import com.careconnect.entity.User;
import com.careconnect.repository.HospitalRepository;
import com.careconnect.repository.MedicalStaffRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.security.JwtTokenProvider;
import com.careconnect.util.PhoneNumberUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicalStaffRepository medicalStaffRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
            HospitalRepository hospitalRepository,
            MedicalStaffRepository medicalStaffRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthDtos.JwtResponse registerHospital(AuthDtos.RegisterHospitalRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizePhoneOrThrow(request.getPhoneNumber()));
        user.setRole(Role.ROLE_HOSPITAL);
        user.setEnabled(true);
        userRepository.save(user);

        Hospital hospital = new Hospital();
        hospital.setUser(user);
        hospital.setName(request.getHospitalName());
        hospital.setCity(request.getCity());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setAddress(request.getAddress());
        hospitalRepository.save(hospital);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        AuthDtos.JwtResponse response = new AuthDtos.JwtResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());
        response.setAvatarUrl(user.getAvatarUrl());
        return response;
    }

    @Transactional
    public AuthDtos.JwtResponse registerStaff(AuthDtos.RegisterStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        Role role = request.getStaffType() == StaffType.DOCTOR ? Role.ROLE_DOCTOR : Role.ROLE_NURSE;

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizePhoneOrThrow(request.getPhoneNumber()));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);

        MedicalStaff staff = new MedicalStaff();
        staff.setUser(user);
        staff.setStaffType(request.getStaffType());
        staff.setSpecialization(request.getSpecialization());
        staff.setLicenseNumber(request.getLicenseNumber());
        staff.setYearsExperience(request.getYearsExperience());
        staff.setLatitude(request.getLatitude());
        staff.setLongitude(request.getLongitude());
        medicalStaffRepository.save(staff);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        AuthDtos.JwtResponse response = new AuthDtos.JwtResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());
        response.setAvatarUrl(user.getAvatarUrl());
        return response;
    }

    public AuthDtos.JwtResponse login(AuthDtos.LoginRequest request) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var principal = (com.careconnect.security.UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtTokenProvider.generateToken(principal.getId(), principal.getUsername(), principal.getRole());
        AuthDtos.JwtResponse response = new AuthDtos.JwtResponse();
        response.setToken(token);
        response.setUserId(principal.getId());
        response.setRole(principal.getRole());
        response.setFullName(user.getFullName());
        response.setAvatarUrl(user.getAvatarUrl());
        return response;
    }

    private String normalizePhoneOrThrow(String rawPhone) {
        String normalized = PhoneNumberUtil.normalizeToE164OrNull(rawPhone);
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }
        if (normalized == null) {
            throw new IllegalArgumentException("Invalid phone number format. Use 10-digit mobile or E.164 format.");
        }
        return normalized;
    }
}
