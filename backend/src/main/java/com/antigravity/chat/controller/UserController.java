package com.antigravity.chat.controller;

import com.antigravity.chat.model.User;
import com.antigravity.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<String>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(User::getUsername)
                .collect(Collectors.toList()));
    }
}
