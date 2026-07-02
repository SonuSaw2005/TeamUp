package com.teamup.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RatingRequest {

    @NotNull
    private Long matchId;

    @NotNull
    private Long ratedUserId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String review;

    // Getters and Setters
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Long getRatedUserId() { return ratedUserId; }
    public void setRatedUserId(Long ratedUserId) { this.ratedUserId = ratedUserId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }
}
