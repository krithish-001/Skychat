package com.antigravity.chat.service;

import com.antigravity.chat.dto.ChatMessage;
import com.antigravity.chat.dto.ConversationDTO;
import com.antigravity.chat.model.Conversation;
import com.antigravity.chat.model.Message;
import com.antigravity.chat.model.User;
import com.antigravity.chat.repository.ConversationRepository;
import com.antigravity.chat.repository.MessageRepository;
import com.antigravity.chat.repository.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ConversationDTO getOrCreateConversation(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1)
                .orElseThrow(() -> new RuntimeException("User not found: " + username1));
        User user2 = userRepository.findByUsername(username2)
                .orElseThrow(() -> new RuntimeException("User not found: " + username2));

        Conversation conversation = conversationRepository.findBetweenUsers(user1, user2)
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation();
                    Set<User> participants = new HashSet<>();
                    participants.add(user1);
                    participants.add(user2);
                    newConversation.setParticipants(participants);
                    return conversationRepository.save(newConversation);
                });
        
        return mapToConversationDto(conversation);
    }

    public List<ChatMessage> getChatHistory(Long conversationId, int page, int size) {
        Page<Message> messages = messageRepository.findByConversationIdOrderByTimestampDesc(
                conversationId, PageRequest.of(page, size));
        
        return messages.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ConversationDTO> getUserConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return conversationRepository.findByParticipantsContainingOrderByLastUpdateDesc(user).stream()
                .map(this::mapToConversationDto)
                .collect(Collectors.toList());
    }

    private ChatMessage mapToDto(Message message) {
        return ChatMessage.builder()
                .id(message.getId())
                .senderUsername(message.getSender().getUsername())
                .conversationId(message.getConversation().getId())
                .content(message.getContent())
                .status(message.getStatus())
                .timestamp(message.getTimestamp())
                .build();
    }

    private ConversationDTO mapToConversationDto(Conversation conversation) {
        return ConversationDTO.builder()
                .id(conversation.getId())
                .participantUsernames(conversation.getParticipants().stream()
                        .map(User::getUsername)
                        .collect(Collectors.toSet()))
                .lastUpdate(conversation.getLastUpdate())
                .build();
    }
}
