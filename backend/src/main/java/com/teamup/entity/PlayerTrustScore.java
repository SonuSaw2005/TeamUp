package com.teamup.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "player_trust_scores")
public class PlayerTrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer matchesPlayed = 0;

    private Double attendancePercentage = 100.0; // Starts at 100%

    private Double cancellationPercentage = 0.0; // Starts at 0%

    private Double sportsmanshipRating = 5.0; // Starts at 5.0

    private Double averageRating = 5.0; // Starts at 5.0

    public PlayerTrustScore() {}

    public PlayerTrustScore(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(Integer matchesPlayed) { this.matchesPlayed = matchesPlayed; }

    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public Double getCancellationPercentage() { return cancellationPercentage; }
    public void setCancellationPercentage(Double cancellationPercentage) { this.cancellationPercentage = cancellationPercentage; }

    public Double getSportsmanshipRating() { return sportsmanshipRating; }
    public void setSportsmanshipRating(Double sportsmanshipRating) { this.sportsmanshipRating = sportsmanshipRating; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}
