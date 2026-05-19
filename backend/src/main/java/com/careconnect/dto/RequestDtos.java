package com.careconnect.dto;

import com.careconnect.entity.RequestStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public class RequestDtos {

    public static class EmergencyRequestCreateDto {
        @NotBlank
        private String title;
        private String description;
        private String city;
        private Double latitude;
        private Double longitude;

        @NotNull
        @Min(0)
        private BigDecimal salaryPerDay;

        @NotNull
        @Min(0)
        private Integer numDoctorsRequired;

        @NotNull
        @Min(0)
        private Integer numNursesRequired;

        private Instant expiresAt;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
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

        public BigDecimal getSalaryPerDay() {
            return salaryPerDay;
        }

        public void setSalaryPerDay(BigDecimal salaryPerDay) {
            this.salaryPerDay = salaryPerDay;
        }

        public Integer getNumDoctorsRequired() {
            return numDoctorsRequired;
        }

        public void setNumDoctorsRequired(Integer numDoctorsRequired) {
            this.numDoctorsRequired = numDoctorsRequired;
        }

        public Integer getNumNursesRequired() {
            return numNursesRequired;
        }

        public void setNumNursesRequired(Integer numNursesRequired) {
            this.numNursesRequired = numNursesRequired;
        }

        public Instant getExpiresAt() {
            return expiresAt;
        }

        public void setExpiresAt(Instant expiresAt) {
            this.expiresAt = expiresAt;
        }
    }

    public static class EmergencyRequestResponseDto {
        private Long id;
        private Long hospitalId;
        private String hospitalName;
        private String title;
        private String description;
        private String city;
        private Double latitude;
        private Double longitude;
        private BigDecimal salaryPerDay;
        private Integer numDoctorsRequired;
        private Integer numNursesRequired;
        private Integer numDoctorsAccepted;
        private Integer numNursesAccepted;
        private RequestStatus status;
        private Instant createdAt;
        private Instant expiresAt;
        private Double distanceKm;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getHospitalId() {
            return hospitalId;
        }

        public void setHospitalId(Long hospitalId) {
            this.hospitalId = hospitalId;
        }

        public String getHospitalName() {
            return hospitalName;
        }

        public void setHospitalName(String hospitalName) {
            this.hospitalName = hospitalName;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
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

        public BigDecimal getSalaryPerDay() {
            return salaryPerDay;
        }

        public void setSalaryPerDay(BigDecimal salaryPerDay) {
            this.salaryPerDay = salaryPerDay;
        }

        public Integer getNumDoctorsRequired() {
            return numDoctorsRequired;
        }

        public void setNumDoctorsRequired(Integer numDoctorsRequired) {
            this.numDoctorsRequired = numDoctorsRequired;
        }

        public Integer getNumNursesRequired() {
            return numNursesRequired;
        }

        public void setNumNursesRequired(Integer numNursesRequired) {
            this.numNursesRequired = numNursesRequired;
        }

        public Integer getNumDoctorsAccepted() {
            return numDoctorsAccepted;
        }

        public void setNumDoctorsAccepted(Integer numDoctorsAccepted) {
            this.numDoctorsAccepted = numDoctorsAccepted;
        }

        public Integer getNumNursesAccepted() {
            return numNursesAccepted;
        }

        public void setNumNursesAccepted(Integer numNursesAccepted) {
            this.numNursesAccepted = numNursesAccepted;
        }

        public RequestStatus getStatus() {
            return status;
        }

        public void setStatus(RequestStatus status) {
            this.status = status;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public Instant getExpiresAt() {
            return expiresAt;
        }

        public void setExpiresAt(Instant expiresAt) {
            this.expiresAt = expiresAt;
        }

        public Double getDistanceKm() {
            return distanceKm;
        }

        public void setDistanceKm(Double distanceKm) {
            this.distanceKm = distanceKm;
        }
    }
}
