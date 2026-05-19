package com.careconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_chatroom_request"))
    private EmergencyRequest request;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ChatRoom() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmergencyRequest getRequest() {
        return request;
    }

    public void setRequest(EmergencyRequest request) {
        this.request = request;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

