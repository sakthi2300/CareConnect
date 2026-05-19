package com.careconnect.websocket;

import com.careconnect.dto.ChatDtos;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Receives messages via STOMP /app/chat.sendMessage.
     * ChatService.saveMessage() handles both persistence and WebSocket broadcast,
     * so no @SendTo annotation needed here.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Payload ChatDtos.ChatMessageRequest request) {
        chatService.saveMessage(principal.getId(), request);
    }

    @MessageMapping("/chat.echo")
    @SendToUser("/queue/reply")
    public String echo(String payload) {
        return payload;
    }
}
