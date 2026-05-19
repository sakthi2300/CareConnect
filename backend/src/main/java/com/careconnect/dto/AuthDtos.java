package com.careconnect.dto;

import com.careconnect.entity.Role;
import com.careconnect.entity.StaffType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class JwtResponse {
        private String token;
        private Long userId;
        private Role role;
        private String fullName;
        private String avatarUrl;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }
    }

    public static class RegisterHospitalRequest {
        @NotBlank
        private String hospitalName;

        @NotBlank
        private String fullName;

        @Email
        @NotBlank
        private String email;

        @NotBlank
        @Size(min = 6)
        private String password;

        @Pattern(regexp = "^$|^\\+?[1-9]\\d{9,14}$", message = "phoneNumber must be a valid phone number")
        private String phoneNumber;
        private String city;
        private Double latitude;
        private Double longitude;
        private String address;
        public String getHospitalName() {
            return hospitalName;
        }

        public void setHospitalName(String hospitalName) {
            this.hospitalName = hospitalName;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }

    public static class RegisterStaffRequest {
        @NotBlank
        private String fullName;

        @Email
        @NotBlank
        private String email;

        @NotBlank
        @Size(min = 6)
        private String password;

        @Pattern(regexp = "^$|^\\+?[1-9]\\d{9,14}$", message = "phoneNumber must be a valid phone number")
        private String phoneNumber;

        @NotNull
        private StaffType staffType;

        private String specialization;
        private String licenseNumber;
        private Integer yearsExperience;
        private Double latitude;
        private Double longitude;
        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public StaffType getStaffType() {
            return staffType;
        }

        public void setStaffType(StaffType staffType) {
            this.staffType = staffType;
        }

        public String getSpecialization() {
            return specialization;
        }

        public void setSpecialization(String specialization) {
            this.specialization = specialization;
        }

        public String getLicenseNumber() {
            return licenseNumber;
        }

        public void setLicenseNumber(String licenseNumber) {
            this.licenseNumber = licenseNumber;
        }

        public Integer getYearsExperience() {
            return yearsExperience;
        }

        public void setYearsExperience(Integer yearsExperience) {
            this.yearsExperience = yearsExperience;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }
}

