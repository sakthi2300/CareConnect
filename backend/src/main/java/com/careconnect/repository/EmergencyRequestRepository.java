package com.careconnect.repository;

import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.Hospital;
import com.careconnect.entity.RequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {

    List<EmergencyRequest> findByHospital(Hospital hospital);

    List<EmergencyRequest> findByHospitalAndStatus(Hospital hospital, RequestStatus status);

    @Lock(LockModeType.OPTIMISTIC_FORCE_INCREMENT)
    @Query("select r from EmergencyRequest r where r.id = :id")
    Optional<EmergencyRequest> findByIdForUpdate(@Param("id") Long id);

    @Query("""
           select r
           from EmergencyRequest r
           where r.status in :statuses
           """)
    List<EmergencyRequest> findByStatuses(@Param("statuses") List<RequestStatus> statuses);

    @Query(
            value = """
                    SELECT *
                    FROM emergency_requests r
                    WHERE r.status IN (:statuses)
                      AND r.latitude IS NOT NULL
                      AND r.longitude IS NOT NULL
                      AND (
                        6371 * ACOS(
                          COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) *
                          COS(RADIANS(r.longitude) - RADIANS(:lng)) +
                          SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude))
                        )
                      ) <= :radiusKm
                    """,
            nativeQuery = true
    )
    List<EmergencyRequest> findNearbyByLocation(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radiusKm") double radiusKm,
            @Param("statuses") List<String> statusNames);
}

