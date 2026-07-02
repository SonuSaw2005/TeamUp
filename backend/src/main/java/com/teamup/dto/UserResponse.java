package com.teamup.dto;

import com.teamup.entity.Role;
import com.teamup.entity.UserSport;
import java.util.List;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Integer age;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private String bio;
    private String profilePictureUrl;
    private Role role;
    private Double averageRating;
    private List<UserSport> sportsInterests;
    private List<String> badges;

    // Trust Score Metrics
    private Integer matchesPlayed = 0;
    private Double attendancePercentage = 100.0;
    private Double cancellationPercentage = 0.0;
    private Double sportsmanshipRating = 5.0;

    public UserResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public List<UserSport> getSportsInterests() { return sportsInterests; }
    public void setSportsInterests(List<UserSport> sportsInterests) { this.sportsInterests = sportsInterests; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }

    public Integer getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(Integer matchesPlayed) { this.matchesPlayed = matchesPlayed; }

    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public Double getCancellationPercentage() { return cancellationPercentage; }
    public void setCancellationPercentage(Double cancellationPercentage) { this.cancellationPercentage = cancellationPercentage; }

    public Double getSportsmanshipRating() { return sportsmanshipRating; }
    public void setSportsmanshipRating(Double sportsmanshipRating) { this.sportsmanshipRating = sportsmanshipRating; }
}
