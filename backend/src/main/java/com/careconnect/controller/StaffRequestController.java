package com.careconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.careconnect.dto.RequestDtos;
import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.MedicalStaff;
import com.careconnect.entity.User;
import com.careconnect.entity.AcceptanceStatus;
import com.careconnect.repository.EmergencyRequestRepository;
import com.careconnect.repository.MedicalStaffRepository;
import com.careconnect.repository.RequestAcceptanceRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.EmergencyRequestService;
import com.careconnect.service.LocationMatchingService;
import com.careconnect.service.RequestAcceptanceService;

@RestController
@RequestMapping("/api/staff/requests")
@PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_NURSE')")
public class StaffRequestController {

    private final LocationMatchingService locationMatchingService;
    private final EmergencyRequestService emergencyRequestService;
    private final RequestAcceptanceService requestAcceptanceService;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final UserRepository userRepository;
    private final MedicalStaffRepository medicalStaffRepository;
    private final RequestAcceptanceRepository requestAcceptanceRepository;

    public StaffRequestController(LocationMatchingService locationMatchingService,
            EmergencyRequestService emergencyRequestService,
            RequestAcceptanceService requestAcceptanceService,
            EmergencyRequestRepository emergencyRequestRepository,
            UserRepository userRepository,
            MedicalStaffRepository medicalStaffRepository,
            RequestAcceptanceRepository requestAcceptanceRepository) {
        this.locationMatchingService = locationMatchingService;
        this.emergencyRequestService = emergencyRequestService;
        this.requestAcceptanceService = requestAcceptanceService;
        this.emergencyRequestRepository = emergencyRequestRepository;
        this.userRepository = userRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.requestAcceptanceRepository = requestAcceptanceRepository;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RequestDtos.EmergencyRequestResponseDto>> getNearbyRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "radiusKm", required = false) Double radiusKm) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        MedicalStaff staff = medicalStaffRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Staff profile not found"));

        Double staffLat = staff.getLatitude();
        Double staffLon = staff.getLongitude();

        if (staffLat == null || staffLon == null) {
            List<RequestDtos.EmergencyRequestResponseDto> dtos = emergencyRequestService
                    .getOpenAndPartiallyFilledRequests();
            List<RequestDtos.EmergencyRequestResponseDto> filtered = dtos.stream()
                    .filter(dto -> !isAlreadyAcceptedByStaff(staff, dto.getId()))
                    .toList();
            return ResponseEntity.ok(filtered);
        }

        var nearby = locationMatchingService.findNearbyRequests(staffLat, staffLon, radiusKm);

        List<RequestDtos.EmergencyRequestResponseDto> dtos = nearby.stream()
                .filter(req -> !isAlreadyAcceptedByStaff(staff, req.getId()))
                .map(req -> {
                    RequestDtos.EmergencyRequestResponseDto dto = emergencyRequestService.toResponseDto(req);
                    double dist = locationMatchingService.distanceKm(
                            staffLat, staffLon, req.getLatitude(), req.getLongitude());
                    dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/accepted")
    public ResponseEntity<List<RequestDtos.EmergencyRequestResponseDto>> getAcceptedRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(requestAcceptanceService.getAcceptedRequests(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDtos.EmergencyRequestResponseDto> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.getRequestById(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<RequestDtos.EmergencyRequestResponseDto> acceptRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        RequestDtos.EmergencyRequestResponseDto updated = requestAcceptanceService.acceptRequest(
                principal.getId(), id);
        return ResponseEntity.ok(updated);
    }

    private boolean isAlreadyAcceptedByStaff(MedicalStaff staff, Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        return requestAcceptanceRepository.existsByRequestAndStaffAndStatus(
                request, staff, AcceptanceStatus.ACCEPTED);
    }
}
