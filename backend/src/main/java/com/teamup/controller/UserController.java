package com.teamup.controller;

import com.teamup.dto.RegisterRequest;
import com.teamup.dto.UserResponse;
import com.teamup.entity.User;
import com.teamup.entity.UserSport;
import com.teamup.service.RecommendationService;
import com.teamup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final RecommendationService recommendationService;

    public UserController(UserService userService, RecommendationService recommendationService) {
        this.userService = userService;
        this.recommendationService = recommendationService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody RegisterRequest request) {
        User user = getAuthenticatedUser();
        User updated = userService.updateUserProfile(user, request);
        return ResponseEntity.ok(userService.getUserProfile(updated));
    }

    @PutMapping("/sports")
    public ResponseEntity<?> updateSports(@RequestBody List<Map<String, Object>> sportsData) {
        User user = getAuthenticatedUser();
        userService.updateSportsInterests(user, sportsData);
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestParam(defaultValue = "5") int limit) {
        User user = getAuthenticatedUser();
        List<RecommendationService.RecommendedTeammate> recommendations = recommendationService.getRecommendations(user, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userService.getUserProfile(user));
    }
}
