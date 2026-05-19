package com.careconnect.controller;

import com.careconnect.dto.ChatDtos;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyAuthority('ROLE_HOSPITAL','ROLE_DOCTOR','ROLE_NURSE')")
    public ResponseEntity<List<ChatDtos.ConversationDto>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(chatService.getConversations(principal.getId()));
    }

    @PostMapping("/requests/{requestId}/messages")
    @PreAuthorize("hasAnyAuthority('ROLE_HOSPITAL','ROLE_DOCTOR','ROLE_NURSE')")
    public ResponseEntity<ChatDtos.ChatMessageDto> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long participantUserId,
            @Valid @RequestBody ChatDtos.ChatMessageRequest request) {
        request.setRequestId(requestId);
        request.setParticipantUserId(participantUserId != null ? participantUserId : request.getParticipantUserId());
        return ResponseEntity.ok(chatService.saveMessage(principal.getId(), request));
    }

    @GetMapping("/requests/{requestId}/messages")
    @PreAuthorize("hasAnyAuthority('ROLE_HOSPITAL','ROLE_DOCTOR','ROLE_NURSE')")
    public ResponseEntity<Page<ChatDtos.ChatMessageDto>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long participantUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getMessagesForRequest(principal.getId(), requestId, participantUserId, page, size));
    }
}
