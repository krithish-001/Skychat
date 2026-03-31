package com.antigravity.chat.controller;

import com.antigravity.chat.dto.ChatMessage;
import com.antigravity.chat.dto.ConversationDTO;
import com.antigravity.chat.service.ChatService;
import com.antigravity.chat.service.MessageProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageProducer messageProducer;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, Authentication authentication) {
        if (authentication != null) {
            String username = authentication.getName();
            chatMessage.setSenderUsername(username);
            messageProducer.sendMessage(chatMessage);
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(Authentication authentication) {
        return ResponseEntity.ok(chatService.getUserConversations(authentication.getName()));
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(chatService.getChatHistory(conversationId, page, size));
    }

    @PostMapping("/conversation/{withUsername}")
    public ResponseEntity<ConversationDTO> startConversation(
            @PathVariable String withUsername, Authentication authentication) {
        return ResponseEntity.ok(chatService.getOrCreateConversation(authentication.getName(), withUsername));
    }
}
