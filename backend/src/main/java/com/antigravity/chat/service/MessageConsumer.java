package com.antigravity.chat.service;

import com.antigravity.chat.dto.ChatMessage;
import com.antigravity.chat.model.Conversation;
import com.antigravity.chat.model.Message;
import com.antigravity.chat.model.User;
import com.antigravity.chat.repository.ConversationRepository;
import com.antigravity.chat.repository.MessageRepository;
import com.antigravity.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageConsumer {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    @Transactional
    public void consume(ChatMessage chatMessage) {
        log.info("Message consumed from Kafka: {}", chatMessage.getContent());

        User sender = userRepository.findByUsername(chatMessage.getSenderUsername()).orElse(null);
        Conversation conversation = conversationRepository.findById(chatMessage.getConversationId()).orElse(null);

        if (sender != null && conversation != null) {
            Message message = Message.builder()
                    .sender(sender)
                    .conversation(conversation)
                    .content(chatMessage.getContent())
                    .status(com.antigravity.chat.model.MessageStatus.SENT)
                    .build();

            messageRepository.save(message);
            
            chatMessage.setId(message.getId());
            chatMessage.setTimestamp(message.getTimestamp());

            // Notify recipient
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getRecipientUsername(),
                    "/queue/messages",
                    chatMessage
            );

            // Notify sender (echoing back with timestamp and id)
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getSenderUsername(),
                    "/queue/messages",
                    chatMessage
            );
        }
    }
}
