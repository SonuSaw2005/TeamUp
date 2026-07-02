package com.teamup.dto;

import com.teamup.entity.SkillLevel;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class MatchRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Future
    private LocalDateTime dateTime;

    @NotNull
    @Min(2)
    private Integer maxPlayers;

    @NotNull
    private Long sportId;

    @NotNull
    private Long groundId;

    @NotNull
    private SkillLevel skillLevelRequired;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public Integer getMaxPlayers() { return maxPlayers; }
    public void setMaxPlayers(Integer maxPlayers) { this.maxPlayers = maxPlayers; }

    public Long getSportId() { return sportId; }
    public void setSportId(Long sportId) { this.sportId = sportId; }

    public Long getGroundId() { return groundId; }
    public void setGroundId(Long groundId) { this.groundId = groundId; }

    public SkillLevel getSkillLevelRequired() { return skillLevelRequired; }
    public void setSkillLevelRequired(SkillLevel skillLevelRequired) { this.skillLevelRequired = skillLevelRequired; }
}
