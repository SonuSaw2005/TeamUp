package com.teamup.controller;

import com.teamup.entity.Match;
import com.teamup.entity.User;
import com.teamup.entity.ParticipantStatus;
import com.teamup.entity.MatchParticipant;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.UserRepository;
import com.teamup.repository.MatchParticipantRepository;
import com.teamup.service.AIRecommendationService;
import com.teamup.service.TeamBalancingService;
import com.teamup.service.WeatherAwarenessService;
import com.teamup.service.NaturalLanguageSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AIRecommendationController {

    private final AIRecommendationService recommendationService;
    private final TeamBalancingService teamBalancingService;
    private final WeatherAwarenessService weatherAwarenessService;
    private final NaturalLanguageSearchService naturalLanguageSearchService;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    public AIRecommendationController(AIRecommendationService recommendationService,
                                      TeamBalancingService teamBalancingService,
                                      WeatherAwarenessService weatherAwarenessService,
                                      NaturalLanguageSearchService naturalLanguageSearchService,
                                      MatchRepository matchRepository,
                                      UserRepository userRepository,
                                      MatchParticipantRepository matchParticipantRepository) {
        this.recommendationService = recommendationService;
        this.teamBalancingService = teamBalancingService;
        this.weatherAwarenessService = weatherAwarenessService;
        this.naturalLanguageSearchService = naturalLanguageSearchService;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.matchParticipantRepository = matchParticipantRepository;
    }

    @GetMapping("/recommendations/matches")
    public ResponseEntity<?> getSmartMatches(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User context not found"));
        }

        List<AIRecommendationService.MatchRecommendation> recs = recommendationService.getSmartMatches(user, 5);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/recommendations/players")
    public ResponseEntity<?> getIntelligentPlayers(@RequestParam Long matchId) {
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) {
            return ResponseEntity.notFound().build();
        }

        List<AIRecommendationService.PlayerRecommendation> recs = recommendationService.getIntelligentPlayers(match, 5);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/recommendations/turfs")
    public ResponseEntity<?> getAITurfs(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User context not found"));
        }

        List<AIRecommendationService.TurfRecommendation> recs = recommendationService.getAITurfs(user, 5);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/matches/{matchId}/balance")
    public ResponseEntity<?> getBalancedTeams(@PathVariable Long matchId) {
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) {
            return ResponseEntity.notFound().build();
        }

        // Query approved match participants using Repository layer
        List<User> participants = matchParticipantRepository.findByMatch(match).stream()
                .filter(p -> p.getStatus() == ParticipantStatus.APPROVED)
                .map(MatchParticipant::getUser)
                .collect(Collectors.toList());

        TeamBalancingService.BalancedTeams balanced = teamBalancingService.balanceTeams(match, participants);
        return ResponseEntity.ok(balanced);
    }

    @GetMapping("/matches/{matchId}/weather")
    public ResponseEntity<?> getMatchWeather(@PathVariable Long matchId) {
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) {
            return ResponseEntity.notFound().build();
        }

        WeatherAwarenessService.WeatherReport report = weatherAwarenessService.checkMatchWeather(match);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchMatches(Authentication authentication, @RequestParam String query) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User context not found"));
        }

        com.teamup.service.NaturalLanguageSearchService.NLQueryFilters filters = naturalLanguageSearchService.parseQuery(query);
        List<AIRecommendationService.MatchRecommendation> recs = recommendationService.getSmartMatches(user, 20);

        List<AIRecommendationService.MatchRecommendation> filtered = recs.stream()
                .filter(rec -> {
                    Match m = rec.getMatch();
                    if (filters.getSport() != null && !m.getSport().getName().equalsIgnoreCase(filters.getSport())) return false;
                    if (filters.getSkillLevel() != null && m.getSkillLevelRequired() != filters.getSkillLevel()) return false;
                    if (filters.getMaxDistanceKm() != null && rec.getDistanceInKm() > filters.getMaxDistanceKm()) return false;
                    return true;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }
}
