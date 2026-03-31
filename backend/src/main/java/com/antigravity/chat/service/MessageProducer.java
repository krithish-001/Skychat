package com.antigravity.chat.service;

import com.antigravity.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageProducer {
    private static final String TOPIC = "chat-messages";
    private final KafkaTemplate<String, ChatMessage> kafkaTemplate;

    public void sendMessage(ChatMessage message) {
        // Use recipientUsername as the partition key to ensure order for each user's messages
        kafkaTemplate.send(TOPIC, message.getRecipientUsername(), message);
    }
}
