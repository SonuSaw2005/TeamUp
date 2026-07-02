package com.teamup.service;

import com.teamup.entity.PlayerTrustScore;
import com.teamup.entity.User;
import com.teamup.repository.PlayerTrustScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrustScoreService {

    private final PlayerTrustScoreRepository trustScoreRepository;

    public TrustScoreService(PlayerTrustScoreRepository trustScoreRepository) {
        this.trustScoreRepository = trustScoreRepository;
    }

    @Transactional
    public PlayerTrustScore getOrCreateTrustScore(User user) {
        return trustScoreRepository.findByUser(user)
                .orElseGet(() -> {
                    PlayerTrustScore score = new PlayerTrustScore(user);
                    return trustScoreRepository.save(score);
                });
    }

    @Transactional
    public void recordMatchPlayed(User user, boolean attended) {
        PlayerTrustScore score = getOrCreateTrustScore(user);
        int total = score.getMatchesPlayed() + 1;
        score.setMatchesPlayed(total);

        // Update attendance rate
        double currentAttendance = score.getAttendancePercentage();
        double newAttendance = attended 
                ? ((currentAttendance * (total - 1)) + 100.0) / total 
                : (currentAttendance * (total - 1)) / total;
        
        score.setAttendancePercentage(Math.round(newAttendance * 10.0) / 10.0);
        trustScoreRepository.save(score);
    }

    @Transactional
    public void recordBookingCancellation(User user, boolean wasCancelled) {
        PlayerTrustScore score = getOrCreateTrustScore(user);
        int total = score.getMatchesPlayed() + 1; // Count bookings in total activity
        score.setMatchesPlayed(total);

        double currentCancel = score.getCancellationPercentage();
        double newCancel = wasCancelled 
                ? ((currentCancel * (total - 1)) + 100.0) / total 
                : (currentCancel * (total - 1)) / total;

        score.setCancellationPercentage(Math.round(newCancel * 10.0) / 10.0);
        trustScoreRepository.save(score);
    }

    @Transactional
    public void updateRatings(User user, double avgRating, double sportsmanship) {
        PlayerTrustScore score = getOrCreateTrustScore(user);
        score.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
        score.setSportsmanshipRating(Math.round(sportsmanship * 10.0) / 10.0);
        trustScoreRepository.save(score);
    }
}
