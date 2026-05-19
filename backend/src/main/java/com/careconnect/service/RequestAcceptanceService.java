package com.careconnect.service;

import com.careconnect.dto.RequestDtos;
import com.careconnect.entity.*;
import com.careconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class RequestAcceptanceService {

    private static final Logger log = LoggerFactory.getLogger(RequestAcceptanceService.class);

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final MedicalStaffRepository medicalStaffRepository;
    private final RequestAcceptanceRepository requestAcceptanceRepository;
    private final UserRepository userRepository;
    private final EmergencyRequestService emergencyRequestService;
    private final SimpMessagingTemplate messagingTemplate;

    public RequestAcceptanceService(EmergencyRequestRepository emergencyRequestRepository,
            MedicalStaffRepository medicalStaffRepository,
            RequestAcceptanceRepository requestAcceptanceRepository,
            UserRepository userRepository,
            EmergencyRequestService emergencyRequestService,
            SimpMessagingTemplate messagingTemplate) {
        this.emergencyRequestRepository = emergencyRequestRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.requestAcceptanceRepository = requestAcceptanceRepository;
        this.userRepository = userRepository;
        this.emergencyRequestService = emergencyRequestService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Accept an emergency request for the given staff user.
     * Returns the updated request DTO for the frontend.
     */
    @Transactional
    public RequestDtos.EmergencyRequestResponseDto acceptRequest(Long userId, Long requestId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MedicalStaff staff = medicalStaffRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Staff profile not found"));

        EmergencyRequest request = emergencyRequestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() == RequestStatus.CANCELLED) {
            throw new IllegalStateException("Request has been cancelled");
        }
        if (request.getStatus() == RequestStatus.EXPIRED) {
            throw new IllegalStateException("Request has expired");
        }
        if (request.getStatus() == RequestStatus.FILLED) {
            throw new IllegalStateException("Request is already fully filled");
        }

        // Idempotency: check for existing acceptance
        var existing = requestAcceptanceRepository.findByRequestAndStaff(request, staff);
        if (existing.isPresent()) {
            log.info("Staff userId={} already accepted requestId={}, returning existing state", userId, requestId);
            return emergencyRequestService.toResponseDto(request);
        }

        StaffType staffType = staff.getStaffType();
        long currentCount = requestAcceptanceRepository.countByRequestAndStaffType(request, staffType);

        if (staffType == StaffType.DOCTOR) {
            if (currentCount >= request.getNumDoctorsRequired()) {
                throw new IllegalStateException("Doctor slots are already filled");
            }
            request.setNumDoctorsAccepted((int) currentCount + 1);
        } else {
            if (currentCount >= request.getNumNursesRequired()) {
                throw new IllegalStateException("Nurse slots are already filled");
            }
            request.setNumNursesAccepted((int) currentCount + 1);
        }

        var acceptance = new RequestAcceptance();
        acceptance.setRequest(request);
        acceptance.setStaff(staff);
        acceptance.setStaffType(staffType);
        acceptance.setStatus(AcceptanceStatus.ACCEPTED);
        acceptance.setAcceptedAt(Instant.now());
        requestAcceptanceRepository.save(acceptance);

        if (request.getNumDoctorsAccepted() >= request.getNumDoctorsRequired()
                && request.getNumNursesAccepted() >= request.getNumNursesRequired()) {
            request.setStatus(RequestStatus.FILLED);
        } else {
            request.setStatus(RequestStatus.PARTIALLY_FILLED);
        }

        emergencyRequestRepository.save(request);

        log.info("Request accepted by staffId={} (userId={}) for requestId={}, newStatus={}",
                staff.getId(), userId, requestId, request.getStatus());

        // Build response DTO
        final var responseDto = emergencyRequestService.toResponseDto(request);

        // Broadcast updated request via WebSocket after transaction commits
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("Broadcasting request update for requestId={} to /topic/emergency-requests", requestId);
                messagingTemplate.convertAndSend("/topic/emergency-requests",
                        Map.of("type", "REQUEST_UPDATED", "request", responseDto));
            }
        });

        return responseDto;
    }

    @Transactional(readOnly = true)
    public List<RequestDtos.EmergencyRequestResponseDto> getAcceptedRequests(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return requestAcceptanceRepository
                .findAcceptedRequestsByStaffUserId(userId, AcceptanceStatus.ACCEPTED)
                .stream()
                .map(emergencyRequestService::toResponseDto)
                .toList();
    }
}
