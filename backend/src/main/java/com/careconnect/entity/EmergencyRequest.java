package com.careconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "emergency_requests",
        indexes = {
                @Index(name = "idx_emergency_requests_lat_lng", columnList = "latitude, longitude"),
                @Index(name = "idx_emergency_requests_status", columnList = "status")
        }
)
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_request_hospital"))
    private Hospital hospital;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 150)
    private String city;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(precision = 12, scale = 2)
    private BigDecimal salaryPerDay;

    @Column(nullable = false)
    private Integer numDoctorsRequired;

    @Column(nullable = false)
    private Integer numNursesRequired;

    @Column(nullable = false)
    private Integer numDoctorsAccepted = 0;

    @Column(nullable = false)
    private Integer numNursesAccepted = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestStatus status = RequestStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Column
    private Instant expiresAt;

    @Version
    private Long version;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public EmergencyRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}

