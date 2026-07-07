package com.teamup.service;

import com.teamup.dto.UserResponse;
import com.teamup.entity.Match;
import com.teamup.entity.SkillLevel;
import com.teamup.entity.User;
import com.teamup.entity.UserSport;
import com.teamup.repository.UserSportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamBalancingService {

    private final UserSportRepository userSportRepository;
    private final UserService userService;

    public TeamBalancingService(UserSportRepository userSportRepository, UserService userService) {
        this.userSportRepository = userSportRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public BalancedTeams balanceTeams(Match match, List<User> players) {
        if (players == null || players.isEmpty()) {
            return new BalancedTeams(new ArrayList<>(), new ArrayList<>(), 0.0, 0.0);
        }

        // Map players to their calculated skill weight for this sport
        List<PlayerSkillWeight> weightedPlayers = players.stream()
                .map(player -> {
                    int weight = getSkillWeightForSport(player, match.getSport().getId());
                    return new PlayerSkillWeight(userService.getUserProfile(player), weight);
                })
                .sorted(Comparator.comparingInt(PlayerSkillWeight::getWeight).reversed())
                .collect(Collectors.toList());

        List<PlayerSkillWeight> teamA = new ArrayList<>();
        List<PlayerSkillWeight> teamB = new ArrayList<>();
        int sumA = 0;
        int sumB = 0;

        // Partition using greedy number partitioning (Karmarkar-Karp heuristic base)
        for (PlayerSkillWeight p : weightedPlayers) {
            if (sumA <= sumB) {
                teamA.add(p);
                sumA += p.getWeight();
            } else {
                teamB.add(p);
                sumB += p.getWeight();
            }
        }

        double avgA = teamA.isEmpty() ? 0.0 : (double) sumA / teamA.size();
        double avgB = teamB.isEmpty() ? 0.0 : (double) sumB / teamB.size();

        return new BalancedTeams(
                teamA.stream().map(PlayerSkillWeight::getUser).collect(Collectors.toList()),
                teamB.stream().map(PlayerSkillWeight::getUser).collect(Collectors.toList()),
                Math.round(avgA * 10.0) / 10.0,
                Math.round(avgB * 10.0) / 10.0
        );
    }

    private int getSkillWeightForSport(User user, Long sportId) {
        List<UserSport> sports = userSportRepository.findByUser(user);
        UserSport target = sports.stream()
                .filter(us -> us.getSport().getId().equals(sportId))
                .findFirst()
                .orElse(null);

        if (target == null) {
            return 2; // Default to Intermediate (weight 2)
        }

        return switch (target.getSkillLevel()) {
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
        };
    }

    private static class PlayerSkillWeight {
        private final UserResponse user;
        private final int weight;

        public PlayerSkillWeight(UserResponse user, int weight) {
            this.user = user;
            this.weight = weight;
        }

        public UserResponse getUser() { return user; }
        public int getWeight() { return weight; }
    }

    public static class BalancedTeams {
        private List<UserResponse> teamA;
        private List<UserResponse> teamB;
        private double averageSkillA;
        private double averageSkillB;

        public BalancedTeams(List<UserResponse> teamA, List<UserResponse> teamB, double averageSkillA, double averageSkillB) {
            this.teamA = teamA;
            this.teamB = teamB;
            this.averageSkillA = averageSkillA;
            this.averageSkillB = averageSkillB;
        }

        public List<UserResponse> getTeamA() { return teamA; }
        public List<UserResponse> getTeamB() { return teamB; }
        public double getAverageSkillA() { return averageSkillA; }
        public double getAverageSkillB() { return averageSkillB; }
    }
}
