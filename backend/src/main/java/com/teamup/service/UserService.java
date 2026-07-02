package com.teamup.service;

import com.teamup.dto.RegisterRequest;
import com.teamup.dto.UserResponse;
import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.RatingRepository;
import com.teamup.repository.UserAchievementRepository;
import com.teamup.repository.UserRepository;
import com.teamup.repository.UserSportRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSportRepository userSportRepository;
    private final RatingRepository ratingRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.teamup.repository.SportRepository sportRepository;
    private final com.teamup.repository.PlayerTrustScoreRepository trustScoreRepository;

    public UserService(UserRepository userRepository,
                       UserSportRepository userSportRepository,
                       RatingRepository ratingRepository,
                       UserAchievementRepository userAchievementRepository,
                       PasswordEncoder passwordEncoder,
                       com.teamup.repository.SportRepository sportRepository,
                       com.teamup.repository.PlayerTrustScoreRepository trustScoreRepository) {
        this.userRepository = userRepository;
        this.userSportRepository = userSportRepository;
        this.ratingRepository = ratingRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.passwordEncoder = passwordEncoder;
        this.sportRepository = sportRepository;
        this.trustScoreRepository = trustScoreRepository;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAge(request.getAge());
        user.setLocationName(request.getLocationName());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setBio(request.getBio());
        user.setRole(Role.USER);

        // Verification Setup
        user.setIsVerified(false);
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        User savedUser = userRepository.save(user);

        // Simulate sending email
        System.out.println("=================================================");
        System.out.println("SIMULATED EMAIL VERIFICATION FOR: " + request.getEmail());
        System.out.println("Verification URL: http://localhost:8080/api/auth/verify?token=" + token);
        System.out.println("=================================================");

        // Award default badge
        unlockAchievement(savedUser, "Rookie", "Joined the TeamUp platform!");

        return savedUser;
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        
        user.setIsVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        userRepository.save(user);

        // Simulate sending email
        System.out.println("=================================================");
        System.out.println("SIMULATED PASSWORD RESET FOR: " + email);
        System.out.println("Reset URL: http://localhost:3000/reset-password?token=" + token);
        System.out.println("=================================================");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setAge(user.getAge());
        response.setLocationName(user.getLocationName());
        response.setLatitude(user.getLatitude());
        response.setLongitude(user.getLongitude());
        response.setBio(user.getBio());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setRole(user.getRole());

        // Average rating
        List<Rating> ratings = ratingRepository.findByRated(user);
        double avg = ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
        response.setAverageRating(Math.round(avg * 10.0) / 10.0);

        // Sports interests
        response.setSportsInterests(userSportRepository.findByUser(user));

        // Badges
        List<String> badges = userAchievementRepository.findByUser(user).stream()
                .map(UserAchievement::getBadgeName)
                .collect(Collectors.toList());
        response.setBadges(badges);

        // Map Trust Score
        PlayerTrustScore trustScore = trustScoreRepository.findByUser(user)
                .orElse(new PlayerTrustScore(user));
        response.setMatchesPlayed(trustScore.getMatchesPlayed());
        response.setAttendancePercentage(trustScore.getAttendancePercentage());
        response.setCancellationPercentage(trustScore.getCancellationPercentage());
        response.setSportsmanshipRating(trustScore.getSportsmanshipRating());

        return response;
    }

    @Transactional
    public User updateUserProfile(User user, RegisterRequest request) {
        user.setName(request.getName());
        user.setAge(request.getAge());
        user.setLocationName(request.getLocationName());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setBio(request.getBio());
        
        User saved = userRepository.save(user);
        
        // Award badge for completed profile
        if (user.getBio() != null && !user.getBio().isEmpty() && user.getAge() != null) {
            unlockAchievement(saved, "Profiler", "Completed user profile and bio!");
        }

        return saved;
    }

    @Transactional
    public void updateSportsInterests(User user, List<java.util.Map<String, Object>> sportsData) {
        userSportRepository.deleteByUser(user);
        user.getSportsInterests().clear();
        userRepository.saveAndFlush(user); // Flush modifications

        for (java.util.Map<String, Object> data : sportsData) {
            Long sportId = ((Number) data.get("sportId")).longValue();
            SkillLevel skillLevel = SkillLevel.valueOf((String) data.get("skillLevel"));
            Sport sport = sportRepository.findById(sportId)
                    .orElseThrow(() -> new IllegalArgumentException("Sport not found"));
            UserSport us = new UserSport(user, sport, skillLevel);
            userSportRepository.save(us);
        }
    }

    @Transactional
    public void unlockAchievement(User user, String badgeName, String description) {
        List<UserAchievement> current = userAchievementRepository.findByUser(user);
        boolean exists = current.stream().anyMatch(a -> a.getBadgeName().equalsIgnoreCase(badgeName));
        if (!exists) {
            UserAchievement achievement = new UserAchievement(user, badgeName, description);
            userAchievementRepository.save(achievement);
        }
    }
}
