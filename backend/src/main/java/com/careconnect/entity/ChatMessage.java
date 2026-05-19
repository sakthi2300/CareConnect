package com.careconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_room_id", columnList = "room_id"),
        @Index(name = "idx_chat_messages_sent_at", columnList = "sentAt"),
        @Index(name = "idx_chat_messages_participant_user_id", columnList = "participantUserId")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_chatmessage_room"))
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_chatmessage_sender_user"))
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Instant sentAt = Instant.now();

    @Column(nullable = false)
    private boolean visibleToAll = true;

    @Column
    private Long participantUserId;

    public ChatMessage() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatRoom getRoom() {
        return room;
    }

    public void setRoom(ChatRoom room) {
        this.room = room;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isVisibleToAll() {
        return visibleToAll;
    }

    public void setVisibleToAll(boolean visibleToAll) {
        this.visibleToAll = visibleToAll;
    }

    public Long getParticipantUserId() {
        return participantUserId;
    }

    public void setParticipantUserId(Long participantUserId) {
        this.participantUserId = participantUserId;
    }
}

