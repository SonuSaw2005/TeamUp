package com.teamup.service;

import com.teamup.dto.UserResponse;
import com.teamup.entity.PlayerTrustScore;
import com.teamup.entity.SkillLevel;
import com.teamup.entity.User;
import com.teamup.entity.UserSport;
import com.teamup.repository.PlayerTrustScoreRepository;
import com.teamup.repository.UserRepository;
import com.teamup.repository.UserSportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepository;
    private final UserSportRepository userSportRepository;
    private final UserService userService;
    private final PlayerTrustScoreRepository trustScoreRepository;

    public RecommendationService(UserRepository userRepository,
                                 UserSportRepository userSportRepository,
                                 UserService userService,
                                 PlayerTrustScoreRepository trustScoreRepository) {
        this.userRepository = userRepository;
        this.userSportRepository = userSportRepository;
        this.userService = userService;
        this.trustScoreRepository = trustScoreRepository;
    }

    @Transactional(readOnly = true)
    public List<RecommendedTeammate> getRecommendations(User targetUser, int limit) {
        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(targetUser.getId()))
                .filter(User::getIsVerified)
                .collect(Collectors.toList());

        List<UserSport> targetSports = userSportRepository.findByUser(targetUser);
        if (targetSports.isEmpty()) {
            return allUsers.stream()
                    .map(u -> {
                        double distance = calculateDistance(
                                targetUser.getLatitude() != null ? targetUser.getLatitude() : 0.0,
                                targetUser.getLongitude() != null ? targetUser.getLongitude() : 0.0,
                                u.getLatitude() != null ? u.getLatitude() : 0.0,
                                u.getLongitude() != null ? u.getLongitude() : 0.0
                        );
                        double distanceScore = Math.max(0.0, 1.0 - (distance / 50.0));
                        
                        // Default Trust Score check
                        PlayerTrustScore score = trustScoreRepository.findByUser(u).orElse(null);
                        double trustWeight = 1.0;
                        if (score != null) {
                            trustWeight = (score.getAttendancePercentage() / 100.0) * (1.0 - (score.getCancellationPercentage() / 100.0));
                        }
                        
                        double overallScore = distanceScore * 0.7 * trustWeight;
                        return new RecommendedTeammate(userService.getUserProfile(u), overallScore, distance);
                    })
                    .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        Map<Long, SkillLevel> targetSportMap = targetSports.stream()
                .collect(Collectors.toMap(us -> us.getSport().getId(), UserSport::getSkillLevel));

        List<RecommendedTeammate> recommendations = new ArrayList<>();

        for (User u : allUsers) {
            List<UserSport> uSports = userSportRepository.findByUser(u);
            if (uSports.isEmpty()) continue;

            // 1. Sport Overlap
            long overlapCount = uSports.stream()
                    .filter(us -> targetSportMap.containsKey(us.getSport().getId()))
                    .count();
            double sportOverlapScore = (double) overlapCount / targetSports.size();

            // 2. Skill Variance
            double skillScore = 0.5;
            if (overlapCount > 0) {
                double totalSkillDiffScore = 0.0;
                int comparedSports = 0;
                for (UserSport us : uSports) {
                    SkillLevel targetLevel = targetSportMap.get(us.getSport().getId());
                    if (targetLevel != null) {
                        int diff = Math.abs(targetLevel.ordinal() - us.getSkillLevel().ordinal());
                        double score = switch (diff) {
                            case 0 -> 1.0;
                            case 1 -> 0.7;
                            default -> 0.3;
                        };
                        totalSkillDiffScore += score;
                        comparedSports++;
                    }
                }
                skillScore = totalSkillDiffScore / comparedSports;
            }

            // 3. Distance
            double distance = calculateDistance(
                    targetUser.getLatitude() != null ? targetUser.getLatitude() : 0.0,
                    targetUser.getLongitude() != null ? targetUser.getLongitude() : 0.0,
                    u.getLatitude() != null ? u.getLatitude() : 0.0,
                    u.getLongitude() != null ? u.getLongitude() : 0.0
            );
            double distanceScore = Math.max(0.0, 1.0 - (distance / 50.0));

            // 4. Trust Factor weight (Attendance % (40%), Cancellation % (30%), Average Rating (30%))
            PlayerTrustScore trustScore = trustScoreRepository.findByUser(u).orElse(new PlayerTrustScore(u));
            double attFactor = trustScore.getAttendancePercentage() / 100.0;
            double cancelFactor = 1.0 - (trustScore.getCancellationPercentage() / 100.0);
            double ratingFactor = trustScore.getAverageRating() / 5.0;
            double trustScoreWeight = (attFactor * 0.4) + (cancelFactor * 0.3) + (ratingFactor * 0.3);

            // 5. Total Score (Distance 40%, Sports Overlap 20%, Skill 20%, Trust 20%)
            double overallScore = (distanceScore * 0.4) + (sportOverlapScore * 0.2) + (skillScore * 0.2) + (trustScoreWeight * 0.2);

            recommendations.add(new RecommendedTeammate(
                    userService.getUserProfile(u),
                    Math.round(overallScore * 100.0) / 100.0,
                    Math.round(distance * 10.0) / 10.0
            ));
        }

        return recommendations.stream()
                .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
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

    public static class RecommendedTeammate {
        private UserResponse user;
        private double matchScore;
        private double distanceInKm;

        public RecommendedTeammate(UserResponse user, double matchScore, double distanceInKm) {
            this.user = user;
            this.matchScore = matchScore;
            this.distanceInKm = distanceInKm;
        }

        public UserResponse getUser() { return user; }
        public double getMatchScore() { return matchScore; }
        public double getDistanceInKm() { return distanceInKm; }
    }
}
