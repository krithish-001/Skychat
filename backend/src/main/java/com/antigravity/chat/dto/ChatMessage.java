package com.antigravity.chat.dto;

import com.antigravity.chat.model.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private Long id;
    private String senderUsername;
    private String recipientUsername;
    private Long conversationId;
    private String content;
    private MessageStatus status;
    private LocalDateTime timestamp;
}
