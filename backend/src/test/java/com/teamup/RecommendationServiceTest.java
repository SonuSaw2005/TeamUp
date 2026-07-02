package com.teamup;

import com.teamup.dto.UserResponse;
import com.teamup.entity.*;
import com.teamup.repository.PlayerTrustScoreRepository;
import com.teamup.repository.UserRepository;
import com.teamup.repository.UserSportRepository;
import com.teamup.service.RecommendationService;
import com.teamup.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RecommendationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSportRepository userSportRepository;

    @Mock
    private UserService userService;

    @Mock
    private PlayerTrustScoreRepository trustScoreRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private User targetUser;
    private User otherUser1;
    private User otherUser2;
    private Sport football;
    private Sport basketball;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        // Core Objects
        football = new Sport("Football", "sports_soccer");
        football.setId(1L);

        basketball = new Sport("Basketball", "sports_basketball");
        basketball.setId(2L);

        // Target User: Bengaluru (12.9716, 77.5946)
        targetUser = new User("Target Player", "target@test.com", "password");
        targetUser.setId(10L);
        targetUser.setLatitude(12.9716);
        targetUser.setLongitude(77.5946);
        targetUser.setIsVerified(true);

        // Player 1: Very close, matching interests (Football)
        otherUser1 = new User("Player One", "one@test.com", "password");
        otherUser1.setId(11L);
        otherUser1.setLatitude(12.9784); // ~1km
        otherUser1.setLongitude(77.6408);
        otherUser1.setIsVerified(true);

        // Player 2: Further away, matching interests
        otherUser2 = new User("Player Two", "two@test.com", "password");
        otherUser2.setId(12L);
        otherUser2.setLatitude(13.0232); // ~15km
        otherUser2.setLongitude(77.6432);
        otherUser2.setIsVerified(true);
    }

    @Test
    public void testGetRecommendations_OverlapAndDistance() {
        // Setup User Sports
        List<UserSport> targetSports = List.of(new UserSport(targetUser, football, SkillLevel.INTERMEDIATE));
        List<UserSport> u1Sports = List.of(new UserSport(otherUser1, football, SkillLevel.INTERMEDIATE));
        List<UserSport> u2Sports = List.of(new UserSport(otherUser2, football, SkillLevel.BEGINNER));

        when(userSportRepository.findByUser(targetUser)).thenReturn(targetSports);
        when(userSportRepository.findByUser(otherUser1)).thenReturn(u1Sports);
        when(userSportRepository.findByUser(otherUser2)).thenReturn(u2Sports);

        // Mock Trust Scores
        when(trustScoreRepository.findByUser(any(User.class))).thenReturn(Optional.of(new PlayerTrustScore()));

        // Setup All Users list
        List<User> allUsers = List.of(otherUser1, otherUser2);
        when(userRepository.findAll()).thenReturn(allUsers);

        // Setup profile responses
        UserResponse r1 = new UserResponse(); r1.setName("Player One");
        UserResponse r2 = new UserResponse(); r2.setName("Player Two");
        when(userService.getUserProfile(otherUser1)).thenReturn(r1);
        when(userService.getUserProfile(otherUser2)).thenReturn(r2);

        // Execute
        List<RecommendationService.RecommendedTeammate> results = recommendationService.getRecommendations(targetUser, 5);

        // Assertions
        assertNotNull(results);
        assertEquals(2, results.size());
        
        // Player One should be ranked higher due to proximity (1km vs 15km) and matching skill level
        assertEquals("Player One", results.get(0).getUser().getName());
        assertTrue(results.get(0).getMatchScore() > results.get(1).getMatchScore());
    }
}
