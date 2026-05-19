package com.careconnect.repository;

import com.careconnect.entity.ChatMessage;
import com.careconnect.entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByRoomOrderBySentAtAsc(ChatRoom room, Pageable pageable);

    List<ChatMessage> findByRoomOrderBySentAtAsc(ChatRoom room);

    Page<ChatMessage> findByRoomAndParticipantUserIdOrderBySentAtAsc(ChatRoom room, Long participantUserId, Pageable pageable);

    List<ChatMessage> findByRoomAndParticipantUserIdOrderBySentAtAsc(ChatRoom room, Long participantUserId);

    @Query("SELECT m FROM ChatMessage m WHERE m.room = :room ORDER BY m.sentAt DESC LIMIT 1")
    Optional<ChatMessage> findTopByRoomOrderBySentAtDesc(ChatRoom room);

    Optional<ChatMessage> findTopByRoomAndParticipantUserIdOrderBySentAtDesc(ChatRoom room, Long participantUserId);
}
