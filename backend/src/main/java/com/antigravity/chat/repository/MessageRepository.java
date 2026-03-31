package com.antigravity.chat.repository;

import com.antigravity.chat.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByConversationIdOrderByTimestampDesc(Long conversationId, Pageable pageable);
}
