package com.teamup.controller;

import com.teamup.dto.MatchRequest;
import com.teamup.entity.Match;
import com.teamup.entity.MatchStatus;
import com.teamup.entity.SkillLevel;
import com.teamup.entity.User;
import com.teamup.service.MatchService;
import com.teamup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;
    private final UserService userService;

    public MatchController(MatchService matchService, UserService userService) {
        this.matchService = matchService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping
    public ResponseEntity<Match> createMatch(@Valid @RequestBody MatchRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(matchService.createMatch(request, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable Long id) {
        // Can build a custom view or return directly
        return ResponseEntity.ok(matchService.browseMatches(null, null, null, null, null, null).stream()
                .filter(m -> m.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Match not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Match> updateMatch(@PathVariable Long id, @Valid @RequestBody MatchRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(matchService.updateMatch(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMatch(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        matchService.deleteMatch(id, user);
        return ResponseEntity.ok(Map.of("message", "Match deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<List<Match>> browseMatches(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) SkillLevel skillLevel,
            @RequestParam(required = false) MatchStatus status,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radius) {
        return ResponseEntity.ok(matchService.browseMatches(sportId, skillLevel, status, lat, lon, radius));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinMatch(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        matchService.joinMatch(id, user);
        return ResponseEntity.ok(Map.of("message", "Join request submitted. Waiting for organizer approval."));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveMatch(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        matchService.leaveMatch(id, user);
        return ResponseEntity.ok(Map.of("message", "You have left the match."));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getMatchParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchParticipants(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveParticipant(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam boolean approve) {
        User user = getAuthenticatedUser();
        matchService.approveParticipant(id, userId, user, approve);
        String msg = approve ? "Participant approved" : "Participant rejected";
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeMatch(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        matchService.completeMatch(id, user);
        return ResponseEntity.ok(Map.of("message", "Match completed. Review panel enabled."));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelMatch(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        matchService.cancelMatch(id, user);
        return ResponseEntity.ok(Map.of("message", "Match cancelled successfully."));
    }
}
