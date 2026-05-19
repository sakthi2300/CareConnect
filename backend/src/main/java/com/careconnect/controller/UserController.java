package com.careconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.careconnect.dto.UserDtos.UpdateAvatarRequest;
import com.careconnect.dto.UserDtos.UserProfileDto;
import com.careconnect.entity.User;
import com.careconnect.repository.UserRepository;
import com.careconnect.security.UserPrincipal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        dto.setAvatarUrl(user.getAvatarUrl());

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile/avatar")
    public ResponseEntity<UserProfileDto> updateAvatar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateAvatarRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(user);

        return getProfile(principal);
    }
}
