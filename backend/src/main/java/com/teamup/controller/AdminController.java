package com.teamup.controller;

import com.teamup.entity.Match;
import com.teamup.entity.User;
import com.teamup.repository.GroundRepository;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.TeamRepository;
import com.teamup.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final GroundRepository groundRepository;

    public AdminController(UserRepository userRepository,
                           MatchRepository matchRepository,
                           TeamRepository teamRepository,
                           GroundRepository groundRepository) {
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.groundRepository = groundRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalMatches", matchRepository.count());
        stats.put("totalTeams", teamRepository.count());
        stats.put("totalGrounds", groundRepository.count());
        
        long openMatches = matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == com.teamup.entity.MatchStatus.OPEN)
                .count();
        stats.put("activeOpenMatches", openMatches);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> removeUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User banned and removed from platform"));
    }

    @PutMapping("/matches/{id}/moderate")
    public ResponseEntity<?> moderateMatch(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
        
        match.setDescription(request.get("description")); // Overwrite inappropriate description
        matchRepository.save(match);
        return ResponseEntity.ok(Map.of("message", "Match description modified by moderator"));
    }

    @DeleteMapping("/matches/{id}")
    public ResponseEntity<?> removeInappropriateMatch(@PathVariable Long id) {
        matchRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Inappropriate match removed from platform"));
    }
}
