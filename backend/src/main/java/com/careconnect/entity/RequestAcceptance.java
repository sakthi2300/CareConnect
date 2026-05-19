package com.careconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "request_acceptances",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_request_staff",
                columnNames = {"request_id", "staff_id"}
        ))
public class RequestAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_acceptance_request"))
    private EmergencyRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_acceptance_staff"))
    private MedicalStaff staff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StaffType staffType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AcceptanceStatus status = AcceptanceStatus.ACCEPTED;

    @Column
    private Instant acceptedAt;

    public RequestAcceptance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmergencyRequest getRequest() {
        return request;
    }

    public void setRequest(EmergencyRequest request) {
        this.request = request;
    }

    public MedicalStaff getStaff() {
        return staff;
    }

    public void setStaff(MedicalStaff staff) {
        this.staff = staff;
    }

    public StaffType getStaffType() {
        return staffType;
    }

    public void setStaffType(StaffType staffType) {
        this.staffType = staffType;
    }

    public AcceptanceStatus getStatus() {
        return status;
    }

    public void setStatus(AcceptanceStatus status) {
        this.status = status;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}

