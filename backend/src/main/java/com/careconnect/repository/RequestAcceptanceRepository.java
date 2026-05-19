package com.careconnect.repository;

import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.MedicalStaff;
import com.careconnect.entity.RequestAcceptance;
import com.careconnect.entity.AcceptanceStatus;
import com.careconnect.entity.StaffType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RequestAcceptanceRepository extends JpaRepository<RequestAcceptance, Long> {

    Optional<RequestAcceptance> findByRequestAndStaff(EmergencyRequest request, MedicalStaff staff);

    List<RequestAcceptance> findByRequest(EmergencyRequest request);

    long countByRequestAndStaffType(EmergencyRequest request, StaffType staffType);

    boolean existsByRequestAndStaffAndStatus(
            EmergencyRequest request,
            MedicalStaff staff,
            AcceptanceStatus status);

    @Query("""
            select ra.request
            from RequestAcceptance ra
            join ra.staff ms
            where ms.user.id = :userId
              and ra.status = :status
            order by ra.acceptedAt desc
            """)
    List<EmergencyRequest> findAcceptedRequestsByStaffUserId(
            @Param("userId") Long userId,
            @Param("status") AcceptanceStatus status);

    @Query("""
            select ra
            from RequestAcceptance ra
            join fetch ra.staff ms
            join fetch ms.user u
            where ra.request = :request
              and ra.status = :status
            order by ra.acceptedAt desc
            """)
    List<RequestAcceptance> findByRequestAndStatusWithStaffUser(
            @Param("request") EmergencyRequest request,
            @Param("status") AcceptanceStatus status);
}

