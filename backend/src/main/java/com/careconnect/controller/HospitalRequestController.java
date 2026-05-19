package com.careconnect.controller;

import com.careconnect.dto.RequestDtos;
import com.careconnect.entity.RequestStatus;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.EmergencyRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals/requests")
@PreAuthorize("hasAuthority('ROLE_HOSPITAL')")
public class HospitalRequestController {

    private final EmergencyRequestService emergencyRequestService;

    public HospitalRequestController(EmergencyRequestService emergencyRequestService) {
        this.emergencyRequestService = emergencyRequestService;
    }

    @PostMapping
    public ResponseEntity<RequestDtos.EmergencyRequestResponseDto> createRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RequestDtos.EmergencyRequestCreateDto dto) {
        return ResponseEntity.ok(emergencyRequestService.createRequest(principal.getId(), dto));
    }

    @GetMapping
    public ResponseEntity<List<RequestDtos.EmergencyRequestResponseDto>> getHospitalRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "status", required = false) RequestStatus status) {
        return ResponseEntity.ok(emergencyRequestService.getHospitalRequests(principal.getId(), status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDtos.EmergencyRequestResponseDto> getRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.getHospitalRequestById(principal.getId(), id));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        emergencyRequestService.closeRequest(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        emergencyRequestService.deleteRequest(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

