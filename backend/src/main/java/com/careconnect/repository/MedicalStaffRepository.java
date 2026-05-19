package com.careconnect.repository;

import com.careconnect.entity.MedicalStaff;
import com.careconnect.entity.StaffType;
import com.careconnect.entity.User;
import com.careconnect.entity.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MedicalStaffRepository extends JpaRepository<MedicalStaff, Long> {

    Optional<MedicalStaff> findByUser(User user);

    List<MedicalStaff> findByStaffTypeAndAvailabilityStatus(StaffType staffType,
                                                            AvailabilityStatus availabilityStatus);

    @Query("SELECT ms FROM MedicalStaff ms JOIN FETCH ms.user WHERE ms.availabilityStatus = :status")
    List<MedicalStaff> findAllAvailableWithUser(@Param("status") AvailabilityStatus status);
}

