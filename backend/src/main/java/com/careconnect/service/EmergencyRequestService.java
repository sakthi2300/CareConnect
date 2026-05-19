package com.careconnect.service;

import com.careconnect.dto.RequestDtos;
import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.Hospital;
import com.careconnect.entity.RequestStatus;
import com.careconnect.entity.User;
import com.careconnect.repository.EmergencyRequestRepository;
import com.careconnect.repository.HospitalRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.repository.RequestAcceptanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

@Service
public class EmergencyRequestService {

        private static final Logger log = LoggerFactory.getLogger(EmergencyRequestService.class);

        private final EmergencyRequestRepository emergencyRequestRepository;
        private final HospitalRepository hospitalRepository;
        private final UserRepository userRepository;
        private final EmergencyNotificationService notificationService;
        private final RequestAcceptanceRepository requestAcceptanceRepository;

        public EmergencyRequestService(EmergencyRequestRepository emergencyRequestRepository,
                        HospitalRepository hospitalRepository,
                        UserRepository userRepository,
                        EmergencyNotificationService notificationService,
                        RequestAcceptanceRepository requestAcceptanceRepository) {
                this.emergencyRequestRepository = emergencyRequestRepository;
                this.hospitalRepository = hospitalRepository;
                this.userRepository = userRepository;
                this.notificationService = notificationService;
                this.requestAcceptanceRepository = requestAcceptanceRepository;
        }

        @Transactional
        public RequestDtos.EmergencyRequestResponseDto createRequest(Long userId,
                        RequestDtos.EmergencyRequestCreateDto dto) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Hospital hospital = hospitalRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for user"));

                EmergencyRequest request = new EmergencyRequest();
                request.setHospital(hospital);
                request.setTitle(dto.getTitle());
                request.setDescription(dto.getDescription());
                request.setCity(dto.getCity());
                request.setLatitude(dto.getLatitude());
                request.setLongitude(dto.getLongitude());
                request.setSalaryPerDay(dto.getSalaryPerDay());
                request.setNumDoctorsRequired(dto.getNumDoctorsRequired());
                request.setNumNursesRequired(dto.getNumNursesRequired());
                request.setExpiresAt(dto.getExpiresAt());
                request.setStatus(RequestStatus.OPEN);

                emergencyRequestRepository.save(request);
                log.info("Saved emergency request id={} for hospital='{}'", request.getId(), hospital.getName());

                RequestDtos.EmergencyRequestResponseDto responseDto = toResponseDto(request);

                // Broadcast AFTER the transaction commits so data is visible to other queries
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                                log.info("Transaction committed for request id={}, broadcasting WebSocket notification",
                                                request.getId());
                                notificationService.broadcastNewRequest(responseDto);
                        }
                });

                return responseDto;
        }

        @Transactional(readOnly = true)
        public List<RequestDtos.EmergencyRequestResponseDto> getHospitalRequests(Long userId, RequestStatus status) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Hospital hospital = hospitalRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for user"));

                List<EmergencyRequest> requests = status == null
                                ? emergencyRequestRepository.findByHospital(hospital)
                                : emergencyRequestRepository.findByHospitalAndStatus(hospital, status);

                return requests.stream().map(this::toResponseDto).toList();
        }

        @Transactional(readOnly = true)
        public RequestDtos.EmergencyRequestResponseDto getRequestById(Long id) {
                EmergencyRequest request = emergencyRequestRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
                return toResponseDto(request);
        }

        @Transactional(readOnly = true)
        public RequestDtos.EmergencyRequestResponseDto getHospitalRequestById(Long userId, Long requestId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Hospital hospital = hospitalRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for user"));

                EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
                if (!request.getHospital().getId().equals(hospital.getId())) {
                        throw new IllegalArgumentException("Request does not belong to this hospital");
                }
                return toResponseDto(request);
        }

    @Transactional(readOnly = true)
    public List<RequestDtos.EmergencyRequestResponseDto> getOpenAndPartiallyFilledRequests() {
        List<EmergencyRequest> requests = emergencyRequestRepository
                .findByStatuses(List.of(RequestStatus.OPEN, RequestStatus.PARTIALLY_FILLED));
        return requests.stream().map(this::toResponseDto).toList();
    }

        @Transactional
        public void closeRequest(Long userId, Long requestId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Hospital hospital = hospitalRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for user"));

                EmergencyRequest request = emergencyRequestRepository.findByIdForUpdate(requestId)
                                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
                if (!request.getHospital().getId().equals(hospital.getId())) {
                        throw new IllegalArgumentException("Request does not belong to this hospital");
                }
                request.setStatus(RequestStatus.CANCELLED);
        }

        @Transactional
        public void deleteRequest(Long userId, Long requestId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Hospital hospital = hospitalRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for user"));

                EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
                if (!request.getHospital().getId().equals(hospital.getId())) {
                        throw new IllegalArgumentException("Request does not belong to this hospital");
                }
                
                // Delete associated acceptances to prevent foreign key violation
                requestAcceptanceRepository.deleteAll(requestAcceptanceRepository.findByRequest(request));
                
                emergencyRequestRepository.delete(request);
        }

        public RequestDtos.EmergencyRequestResponseDto toResponseDto(EmergencyRequest r) {
                RequestDtos.EmergencyRequestResponseDto dto = new RequestDtos.EmergencyRequestResponseDto();
                dto.setId(r.getId());
                dto.setHospitalId(r.getHospital().getId());
                dto.setHospitalName(r.getHospital().getName());
                dto.setTitle(r.getTitle());
                dto.setDescription(r.getDescription());
                dto.setCity(r.getCity());
                dto.setLatitude(r.getLatitude());
                dto.setLongitude(r.getLongitude());
                dto.setSalaryPerDay(r.getSalaryPerDay());
                dto.setNumDoctorsRequired(r.getNumDoctorsRequired());
                dto.setNumNursesRequired(r.getNumNursesRequired());
                dto.setNumDoctorsAccepted(r.getNumDoctorsAccepted());
                dto.setNumNursesAccepted(r.getNumNursesAccepted());
                dto.setStatus(r.getStatus());
                dto.setCreatedAt(r.getCreatedAt());
                dto.setExpiresAt(r.getExpiresAt());
                return dto;
        }
}
