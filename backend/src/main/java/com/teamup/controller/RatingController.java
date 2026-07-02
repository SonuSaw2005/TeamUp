package com.teamup.controller;

import com.teamup.dto.RatingRequest;
import com.teamup.entity.Rating;
import com.teamup.entity.User;
import com.teamup.service.RatingService;
import com.teamup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;
    private final UserService userService;

    public RatingController(RatingService ratingService, UserService userService) {
        this.ratingService = ratingService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping
    public ResponseEntity<Rating> submitRating(@Valid @RequestBody RatingRequest request) {
        User rater = getAuthenticatedUser();
        return ResponseEntity.ok(ratingService.submitRating(request, rater));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rating>> getRatingsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }
}
