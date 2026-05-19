package com.careconnect.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.careconnect.dto.RequestDtos;
import com.careconnect.entity.AvailabilityStatus;
import com.careconnect.entity.MedicalStaff;
import com.careconnect.entity.StaffType;
import com.careconnect.repository.MedicalStaffRepository;

@Service
public class EmergencyNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmergencyNotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MedicalStaffRepository medicalStaffRepository;
    private final LocationMatchingService locationMatchingService;
    private final SmsService smsService;

    public EmergencyNotificationService(SimpMessagingTemplate messagingTemplate,
            MedicalStaffRepository medicalStaffRepository,
            LocationMatchingService locationMatchingService,
            SmsService smsService) {
        this.messagingTemplate = messagingTemplate;
        this.medicalStaffRepository = medicalStaffRepository;
        this.locationMatchingService = locationMatchingService;
        this.smsService = smsService;
    }

    /**
     * Broadcast a new emergency request to the global WebSocket topic
     * AND send SMS notifications to all available staff.
     * NOTE: This method is called AFTER transaction commit (from afterCommit callback),
     * so Hibernate session is CLOSED. We must use eager-fetch queries.
     */
    public void broadcastNewRequest(RequestDtos.EmergencyRequestResponseDto dto) {
        log.info("Broadcasting emergency request id={} from hospital='{}' to /topic/emergency-requests",
                dto.getId(), dto.getHospitalName());

        // 1. WebSocket broadcast
        try {
            messagingTemplate.convertAndSend("/topic/emergency-requests", dto);
            log.info("Successfully broadcast emergency request id={} via WebSocket", dto.getId());
        } catch (RuntimeException e) {
            log.error("Failed to broadcast emergency request id={}: {}", dto.getId(), e.getMessage(), e);
        }

        // 2. SMS notifications to all eligible staff
        sendSmsToEligibleStaff(dto);

        // 3. Log nearby staff for debugging
        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            logNearbyStaff(dto);
        }
    }

    /**
     * Send SMS to all available staff with phone numbers.
     * Uses JOIN FETCH query to avoid LazyInitializationException
     * since this runs outside a Hibernate session (after transaction commit).
     */
    private void sendSmsToEligibleStaff(RequestDtos.EmergencyRequestResponseDto dto) {
        try {
            // Use eager-fetch query — User entity is loaded with MedicalStaff in one query
            List<MedicalStaff> availableStaff = medicalStaffRepository
                    .findAllAvailableWithUser(AvailabilityStatus.AVAILABLE);

            String message = buildSmsMessage(dto);
            int smsSent = 0;
            int doctorsNeeded = Math.max(0, safeInt(dto.getNumDoctorsRequired()) - safeInt(dto.getNumDoctorsAccepted()));
            int nursesNeeded = Math.max(0, safeInt(dto.getNumNursesRequired()) - safeInt(dto.getNumNursesAccepted()));
            double radiusKm = 10.0;

            for (MedicalStaff staff : availableStaff) {
                if (staff.getStaffType() == StaffType.DOCTOR && doctorsNeeded == 0) {
                    continue;
                }
                if (staff.getStaffType() == StaffType.NURSE && nursesNeeded == 0) {
                    continue;
                }
                if (!locationMatchingService.isWithinRadiusOrNoLocation(
                        staff.getLatitude(), staff.getLongitude(),
                        dto.getLatitude(), dto.getLongitude(),
                        radiusKm)) {
                    continue;
                }

                if (staff.getUser() == null) {
                    continue;
                }

                String phone = staff.getUser().getPhoneNumber(); // safe — User is eagerly fetched
                if (phone != null && !phone.isBlank()) {
                    log.info("Sending SMS to {} (staffId={}, type={})",
                            phone, staff.getId(), staff.getStaffType());
                    smsService.sendSms(phone, message);
                    smsSent++;
                }
            }

            log.info("SMS notifications queued for {} staff members for request id={}", smsSent, dto.getId());
        } catch (RuntimeException e) {
            log.error("Failed to send SMS notifications for request id={}: {}", dto.getId(), e.getMessage(), e);
        }
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String buildSmsMessage(RequestDtos.EmergencyRequestResponseDto dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("[CareConnect] Emergency staffing request!\n");
        sb.append("Hospital: ").append(dto.getHospitalName()).append("\n");
        if (dto.getCity() != null && !dto.getCity().isBlank()) {
            sb.append("Location: ").append(dto.getCity()).append("\n");
        }
        if (dto.getSalaryPerDay() != null) {
            sb.append("Salary: Rs.").append(dto.getSalaryPerDay()).append("/day\n");
        }
        sb.append("Doctors needed: ").append(dto.getNumDoctorsRequired()).append("\n");
        sb.append("Nurses needed: ").append(dto.getNumNursesRequired()).append("\n");
        sb.append("Open the CareConnect app to accept.");
        return sb.toString();
    }

    private void logNearbyStaff(RequestDtos.EmergencyRequestResponseDto dto) {
        try {
            List<MedicalStaff> doctors = medicalStaffRepository
                    .findByStaffTypeAndAvailabilityStatus(StaffType.DOCTOR, AvailabilityStatus.AVAILABLE);
            List<MedicalStaff> nurses = medicalStaffRepository
                    .findByStaffTypeAndAvailabilityStatus(StaffType.NURSE, AvailabilityStatus.AVAILABLE);

            double radiusKm = 10.0;

            long eligibleDoctors = doctors.stream()
                    .filter(s -> locationMatchingService.isWithinRadiusOrNoLocation(
                            s.getLatitude(), s.getLongitude(),
                            dto.getLatitude(), dto.getLongitude(),
                            radiusKm))
                    .count();

            long eligibleNurses = nurses.stream()
                    .filter(s -> locationMatchingService.isWithinRadiusOrNoLocation(
                            s.getLatitude(), s.getLongitude(),
                            dto.getLatitude(), dto.getLongitude(),
                            radiusKm))
                    .count();

            log.info("Emergency request id={}: {} eligible doctors, {} eligible nurses within {}km radius",
                    dto.getId(), eligibleDoctors, eligibleNurses, radiusKm);
        } catch (RuntimeException e) {
            log.warn("Could not compute nearby staff count: {}", e.getMessage());
        }
    }
}
