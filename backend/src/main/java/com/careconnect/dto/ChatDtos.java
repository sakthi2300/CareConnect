package com.careconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class ChatDtos {

    public static class ChatMessageRequest {
        @NotNull
        private Long requestId;

        private Long participantUserId;

        @NotBlank
        private String content;

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Long getParticipantUserId() {
            return participantUserId;
        }

        public void setParticipantUserId(Long participantUserId) {
            this.participantUserId = participantUserId;
        }
    }

    public static class ChatMessageDto {
        private Long id;
        private Long requestId;
        private Long roomId;
        private Long senderUserId;
        private String senderName;
        private String senderRole;
        private Long participantUserId;
        private String content;
        private Instant sentAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }

        public Long getRoomId() {
            return roomId;
        }

        public void setRoomId(Long roomId) {
            this.roomId = roomId;
        }

        public Long getSenderUserId() {
            return senderUserId;
        }

        public void setSenderUserId(Long senderUserId) {
            this.senderUserId = senderUserId;
        }

        public String getSenderName() {
            return senderName;
        }

        public void setSenderName(String senderName) {
            this.senderName = senderName;
        }

        public String getSenderRole() {
            return senderRole;
        }

        public void setSenderRole(String senderRole) {
            this.senderRole = senderRole;
        }

        public Long getParticipantUserId() {
            return participantUserId;
        }

        public void setParticipantUserId(Long participantUserId) {
            this.participantUserId = participantUserId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Instant getSentAt() {
            return sentAt;
        }

        public void setSentAt(Instant sentAt) {
            this.sentAt = sentAt;
        }
    }

    /** Conversation summary DTO for the chat list panel */
    public static class ConversationDto {
        private Long requestId;
        private Long roomId;
        private Long participantUserId;
        private String requestTitle;
        private String otherPartyName;
        private String lastMessage;
        private Instant lastMessageAt;
        private int unreadCount;

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }

        public String getRequestTitle() { return requestTitle; }
        public void setRequestTitle(String requestTitle) { this.requestTitle = requestTitle; }

        public Long getParticipantUserId() { return participantUserId; }
        public void setParticipantUserId(Long participantUserId) { this.participantUserId = participantUserId; }

        public String getOtherPartyName() { return otherPartyName; }
        public void setOtherPartyName(String otherPartyName) { this.otherPartyName = otherPartyName; }

        public String getLastMessage() { return lastMessage; }
        public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

        public Instant getLastMessageAt() { return lastMessageAt; }
        public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

        public int getUnreadCount() { return unreadCount; }
        public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    }
}
