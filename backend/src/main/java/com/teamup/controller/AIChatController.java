package com.teamup.controller;

import com.teamup.entity.Ground;
import com.teamup.entity.Match;
import com.teamup.entity.User;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.UserRepository;
import com.teamup.service.AIRecommendationService;
import com.teamup.service.NaturalLanguageSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/chat")
public class AIChatController {

    private final AIRecommendationService recommendationService;
    private final NaturalLanguageSearchService naturalLanguageSearchService;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    public AIChatController(AIRecommendationService recommendationService,
                            NaturalLanguageSearchService naturalLanguageSearchService,
                            MatchRepository matchRepository,
                            UserRepository userRepository) {
        this.recommendationService = recommendationService;
        this.naturalLanguageSearchService = naturalLanguageSearchService;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> handleChatQuery(Authentication authentication, @RequestBody Map<String, String> request) {
        User user = null;
        if (authentication != null && authentication.getName() != null) {
            user = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("response", "Yo! Type a message to start chatting."));
        }

        String query = userMessage.toLowerCase().trim();
        StringBuilder responseBuilder = new StringBuilder();

        // 1. Check for general informational query patterns first (accessible to guest users)
        if (query.contains("help create") || query.contains("how to create a team")) {
            return ResponseEntity.ok(Map.of("response", "To create a team, click 'Create Team' from your dashboard, set a team name, pick your primary sport, and use the Player Recruitment cards to invite highly reliable teammates!"));
        } else if (query.contains("how to book") || query.contains("booking assistance") || query.contains("book turf")) {
            return ResponseEntity.ok(Map.of("response", "Booking a turf is easy: go to 'Browse Matches', click 'Book Turf Slot', select your preferred ground, and toggle 'Cost Sharing' so players join and auto-split the hourly price!"));
        }

        // Guide guests to log in for personalized database queries
        if (user == null) {
            return ResponseEntity.ok(Map.of("response", "Yo! Please log in to view recommended matches near you, recruit nearby players, or run automated turf recommendations."));
        }

        // 1. Check for specific assistance keywords
        if (query.contains("help create") || query.contains("how to create a team")) {
            responseBuilder.append("To create a team, click 'Create Team' from your dashboard, set a team name, pick your primary sport, and use the Player Recruitment cards to invite highly reliable teammates!");
        } else if (query.contains("how to book") || query.contains("booking assistance") || query.contains("book turf")) {
            responseBuilder.append("Booking a turf is easy: go to 'Browse Matches', click 'Book Turf Slot', select your preferred ground, and toggle 'Cost Sharing' so players join and auto-split the hourly price!");
        } else if (query.contains("matches near me") || query.contains("find matches")) {
            List<AIRecommendationService.MatchRecommendation> matches = recommendationService.getSmartMatches(user, 3);
            if (matches.isEmpty()) {
                responseBuilder.append("I couldn't find any open matches nearby right now. Why not go to 'Browse Matches' and create one?");
            } else {
                responseBuilder.append("Here are some recommended matches near you:\n");
                for (var rec : matches) {
                    Match m = rec.getMatch();
                    responseBuilder.append("- **").append(m.getTitle()).append("** (").append(m.getSport().getName()).append(") at ").append(m.getGround().getName())
                            .append(" | ").append(rec.getConfidenceScore()).append("% Match Score | ").append(rec.getExplanation()).append("\n");
                }
            }
        } else if (query.contains("recommend turf") || query.contains("find turf")) {
            List<AIRecommendationService.TurfRecommendation> turfs = recommendationService.getAITurfs(user, 3);
            responseBuilder.append("Here are the best turfs tailored for you:\n");
            for (var rec : turfs) {
                Ground g = rec.getGround();
                responseBuilder.append("- **").append(g.getName()).append("** | ₹").append(g.getHourlyPrice().intValue()).append("/hr | ").append(rec.getConfidenceScore()).append("% Match Score | ").append(rec.getExplanation()).append("\n");
            }
        } else {
            // 2. Perform Natural Language Search parser execution
            NaturalLanguageSearchService.NLQueryFilters filters = naturalLanguageSearchService.parseQuery(userMessage);
            
            // Check if we parsed any filters
            if (filters.getSport() != null || filters.getMaxDistanceKm() != null || filters.getSkillLevel() != null) {
                responseBuilder.append("I searched the platform matching your criteria:\n");
                if (filters.getSport() != null) responseBuilder.append("- Sport: **").append(filters.getSport()).append("**\n");
                if (filters.getSkillLevel() != null) responseBuilder.append("- Skill Level: **").append(filters.getSkillLevel()).append("**\n");
                if (filters.getMaxDistanceKm() != null) responseBuilder.append("- Max Distance: **").append(filters.getMaxDistanceKm().intValue()).append(" km**\n");

                List<AIRecommendationService.MatchRecommendation> matches = recommendationService.getSmartMatches(user, 10).stream()
                        .filter(rec -> {
                            Match m = rec.getMatch();
                            if (filters.getSport() != null && !m.getSport().getName().equalsIgnoreCase(filters.getSport())) return false;
                            if (filters.getSkillLevel() != null && m.getSkillLevelRequired() != filters.getSkillLevel()) return false;
                            if (filters.getMaxDistanceKm() != null && rec.getDistanceInKm() > filters.getMaxDistanceKm()) return false;
                            return true;
                        })
                        .collect(Collectors.toList());

                if (matches.isEmpty()) {
                    responseBuilder.append("\nNo matches found matching this description. Try broadening your criteria!");
                } else {
                    responseBuilder.append("\nMatching Search Results:\n");
                    for (var rec : matches) {
                        Match m = rec.getMatch();
                        responseBuilder.append("- **").append(m.getTitle()).append("** at ").append(m.getGround().getName())
                                .append(" (Score: ").append(rec.getConfidenceScore()).append("%)\n");
                    }
                }
            } else {
                responseBuilder.append("Yo! I'm your TeamUp AI Assistant. You can ask me to:\n")
                        .append("- \"Find football matches near me\"\n")
                        .append("- \"Recommend the cheapest cricket turf\"\n")
                        .append("- \"How do I book a turf slot?\"\n")
                        .append("- \"Help me create a team\"");
            }
        }

        return ResponseEntity.ok(Map.of("response", responseBuilder.toString()));
    }
}
