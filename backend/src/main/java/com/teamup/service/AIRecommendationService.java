package com.teamup.service;

import com.teamup.dto.UserResponse;
import com.teamup.entity.*;
import com.teamup.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIRecommendationService {

    private final MatchRepository matchRepository;
    private final GroundRepository groundRepository;
    private final UserRepository userRepository;
    private final UserSportRepository userSportRepository;
    private final PlayerTrustScoreRepository trustScoreRepository;
    private final UserService userService;

    public AIRecommendationService(MatchRepository matchRepository,
                                   GroundRepository groundRepository,
                                   UserRepository userRepository,
                                   UserSportRepository userSportRepository,
                                   PlayerTrustScoreRepository trustScoreRepository,
                                   UserService userService) {
        this.matchRepository = matchRepository;
        this.groundRepository = groundRepository;
        this.userRepository = userRepository;
        this.userSportRepository = userSportRepository;
        this.trustScoreRepository = trustScoreRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<MatchRecommendation> getSmartMatches(User targetUser, int limit) {
        List<Match> activeMatches = matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchStatus.OPEN)
                .filter(m -> !m.getCreator().getId().equals(targetUser.getId()))
                .collect(Collectors.toList());

        List<UserSport> targetSports = userSportRepository.findByUser(targetUser);
        Map<Long, SkillLevel> targetSportMap = targetSports.stream()
                .collect(Collectors.toMap(us -> us.getSport().getId(), UserSport::getSkillLevel));

        List<MatchRecommendation> recommendations = new ArrayList<>();

        for (Match m : activeMatches) {
            double score = 0.5; // base score
            List<String> reasons = new ArrayList<>();

            // 1. Sport Match
            boolean sportMatches = targetSportMap.containsKey(m.getSport().getId());
            if (sportMatches) {
                score += 0.25;
                reasons.add("matches your preferred sport (" + m.getSport().getName() + ")");
                
                // Skill match
                SkillLevel targetSkill = targetSportMap.get(m.getSport().getId());
                if (targetSkill == m.getSkillLevelRequired()) {
                    score += 0.15;
                    reasons.add("matches your " + targetSkill + " skill level");
                } else {
                    int diff = Math.abs(targetSkill.ordinal() - m.getSkillLevelRequired().ordinal());
                    if (diff == 1) {
                        score += 0.08;
                        reasons.add("close to your skill level");
                    }
                }
            }

            // 2. Proximity (Distance)
            double distance = 0.0;
            if (m.getGround() != null && targetUser.getLatitude() != null && m.getGround().getLatitude() != null) {
                distance = calculateDistance(
                        targetUser.getLatitude(), targetUser.getLongitude(),
                        m.getGround().getLatitude(), m.getGround().getLongitude()
                );
                double proximityScore = Math.max(0.0, 1.0 - (distance / 15.0)); // scale within 15km
                score += proximityScore * 0.30;
                if (distance <= 3.0) {
                    reasons.add("very close to you (only " + String.format("%.1f", distance) + " km away)");
                } else if (distance <= 8.0) {
                    reasons.add("conveniently located (" + String.format("%.1f", distance) + " km away)");
                }
            }

            // 3. Time Urgency & Popularity
            long hoursUntilStart = ChronoUnit.HOURS.between(LocalDateTime.now(), m.getDateTime());
            if (hoursUntilStart > 0 && hoursUntilStart <= 24) {
                score += 0.10;
                reasons.add("starts within 24 hours");
            }
            
            // Popularity boost if spots are filling up
            if (m.getMaxPlayers() > 0) {
                double fillRatio = 0.5; // default
                score += fillRatio * 0.10;
            }

            // Normalize score to percentage (capped 99%)
            int confidence = (int) Math.min(99.0, Math.max(30.0, score * 100.0));
            
            String explanation = "Recommended because it " + (reasons.isEmpty() ? "is an active match near you" : String.join(", ", reasons)) + ".";

            recommendations.add(new MatchRecommendation(m, confidence, explanation, distance));
        }

        return recommendations.stream()
                .sorted((a, b) -> Integer.compare(b.getConfidenceScore(), a.getConfidenceScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlayerRecommendation> getIntelligentPlayers(Match match, int limit) {
        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .filter(User::getIsVerified)
                .filter(u -> !u.getId().equals(match.getCreator().getId()))
                .collect(Collectors.toList());

        List<PlayerRecommendation> recs = new ArrayList<>();

        for (User u : candidates) {
            double score = 0.4; // Base score
            List<String> reasons = new ArrayList<>();

            // 1. Skill/Sport Match
            List<UserSport> uSports = userSportRepository.findByUser(u);
            boolean playsSport = uSports.stream().anyMatch(us -> us.getSport().getId().equals(match.getSport().getId()));
            if (playsSport) {
                score += 0.25;
                reasons.add("plays " + match.getSport().getName());
                
                UserSport matchSport = uSports.stream()
                        .filter(us -> us.getSport().getId().equals(match.getSport().getId()))
                        .findFirst().orElse(null);
                if (matchSport != null && matchSport.getSkillLevel() == match.getSkillLevelRequired()) {
                    score += 0.15;
                    reasons.add("matches intermediate skill level requirements");
                }
            }

            // 2. Reliability (Trust score)
            PlayerTrustScore trust = trustScoreRepository.findByUser(u).orElse(new PlayerTrustScore(u));
            double reliability = (trust.getAttendancePercentage() != null ? trust.getAttendancePercentage() : 0.0) / 100.0;
            score += reliability * 0.20;
            if (trust.getAttendancePercentage() != null && trust.getAttendancePercentage() >= 90.0) {
                reasons.add("has a highly reliable attendance track record (" + trust.getAttendancePercentage().intValue() + "%)");
            }

            // 3. Proximity
            double distance = 0.0;
            if (match.getGround() != null && u.getLatitude() != null && match.getGround().getLatitude() != null) {
                distance = calculateDistance(
                        u.getLatitude(), u.getLongitude(),
                        match.getGround().getLatitude(), match.getGround().getLongitude()
                );
                double proximityScore = Math.max(0.0, 1.0 - (distance / 20.0));
                score += proximityScore * 0.20;
                if (distance <= 5.0) {
                    reasons.add("lives nearby (" + String.format("%.1f", distance) + " km from turf)");
                }
            }

            int confidence = (int) Math.min(99.0, Math.max(30.0, score * 100.0));
            String explanation = u.getName() + " matches because he " + String.join(", ", reasons) + ".";

            recs.add(new PlayerRecommendation(userService.getUserProfile(u), confidence, explanation, distance));
        }

        return recs.stream()
                .sorted((a, b) -> Integer.compare(b.getConfidenceScore(), a.getConfidenceScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TurfRecommendation> getAITurfs(User user, int limit) {
        List<Ground> grounds = groundRepository.findAll();
        List<UserSport> uSports = userSportRepository.findByUser(user);
        List<String> preferredSportsNames = uSports.stream()
                .map(us -> us.getSport().getName().toLowerCase())
                .collect(Collectors.toList());

        List<TurfRecommendation> recs = new ArrayList<>();

        for (Ground g : grounds) {
            double score = 0.4;
            List<String> reasons = new ArrayList<>();

            // 1. Proximity
            double distance = 0.0;
            if (user.getLatitude() != null && g.getLatitude() != null) {
                distance = calculateDistance(
                        user.getLatitude(), user.getLongitude(),
                        g.getLatitude(), g.getLongitude()
                );
                double proximityScore = Math.max(0.0, 1.0 - (distance / 15.0));
                score += proximityScore * 0.35;
                if (distance <= 4.0) {
                    reasons.add("extremely close to you (" + String.format("%.1f", distance) + " km)");
                } else {
                    reasons.add("located within " + String.format("%.1f", distance) + " km");
                }
            }

            // 2. Sport Matching
            boolean supportsPreferred = false;
            for (String sport : preferredSportsNames) {
                if (g.getSportsAvailable().toLowerCase().contains(sport)) {
                    supportsPreferred = true;
                    break;
                }
            }
            if (supportsPreferred) {
                score += 0.25;
                reasons.add("offers your preferred sports");
            }

            // 3. Price Indexing
            if (g.getHourlyPrice() != null) {
                double priceScore = Math.max(0.0, 1.0 - (g.getHourlyPrice() / 2500.0)); // scale up to 2500 INR
                score += priceScore * 0.20;
                if (g.getHourlyPrice() <= 1200.0) {
                    reasons.add("highly budget-friendly rate (₹" + g.getHourlyPrice().intValue() + "/hr)");
                }
            }

            int confidence = (int) Math.min(99.0, Math.max(30.0, score * 100.0));
            String explanation = "Recommended because it is " + String.join(", and ", reasons) + ".";

            recs.add(new TurfRecommendation(g, confidence, explanation, distance));
        }

        return recs.stream()
                .sorted((a, b) -> Integer.compare(b.getConfidenceScore(), a.getConfidenceScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public static class MatchRecommendation {
        private Match match;
        private int confidenceScore;
        private String explanation;
        private double distanceInKm;

        public MatchRecommendation(Match match, int confidenceScore, String explanation, double distanceInKm) {
            this.match = match;
            this.confidenceScore = confidenceScore;
            this.explanation = explanation;
            this.distanceInKm = distanceInKm;
        }

        public Match getMatch() { return match; }
        public int getConfidenceScore() { return confidenceScore; }
        public String getExplanation() { return explanation; }
        public double getDistanceInKm() { return distanceInKm; }
    }

    public static class PlayerRecommendation {
        private UserResponse player;
        private int confidenceScore;
        private String explanation;
        private double distanceInKm;

        public PlayerRecommendation(UserResponse player, int confidenceScore, String explanation, double distanceInKm) {
            this.player = player;
            this.confidenceScore = confidenceScore;
            this.explanation = explanation;
            this.distanceInKm = distanceInKm;
        }

        public UserResponse getPlayer() { return player; }
        public int getConfidenceScore() { return confidenceScore; }
        public String getExplanation() { return explanation; }
        public double getDistanceInKm() { return distanceInKm; }
    }

    public static class TurfRecommendation {
        private Ground ground;
        private int confidenceScore;
        private String explanation;
        private double distanceInKm;

        public TurfRecommendation(Ground ground, int confidenceScore, String explanation, double distanceInKm) {
            this.ground = ground;
            this.confidenceScore = confidenceScore;
            this.explanation = explanation;
            this.distanceInKm = distanceInKm;
        }

        public Ground getGround() { return ground; }
        public int getConfidenceScore() { return confidenceScore; }
        public String getExplanation() { return explanation; }
        public double getDistanceInKm() { return distanceInKm; }
    }
}
