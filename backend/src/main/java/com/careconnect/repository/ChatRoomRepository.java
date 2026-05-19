package com.careconnect.repository;

import com.careconnect.entity.ChatRoom;
import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByRequest(EmergencyRequest request);

    /** Chat rooms for a hospital (rooms linked to requests owned by this hospital) */
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.request r WHERE r.hospital = :hospital ORDER BY cr.createdAt DESC")
    List<ChatRoom> findByHospital(Hospital hospital);

    /** Chat rooms where the given staff has sent at least one message */
    @Query("SELECT DISTINCT cm.room FROM ChatMessage cm WHERE cm.sender.id = :userId")
    List<ChatRoom> findRoomsWithMessagesBySender(Long userId);

    /** Chat rooms linked to requests accepted by this staff user */
    @Query("""
            SELECT DISTINCT cr
            FROM ChatRoom cr
            JOIN cr.request r
            JOIN RequestAcceptance ra ON ra.request = r
            JOIN ra.staff ms
            WHERE ms.user.id = :userId
              AND ra.status = com.careconnect.entity.AcceptanceStatus.ACCEPTED
            """)
    List<ChatRoom> findRoomsForAcceptedStaffUser(Long userId);
}
