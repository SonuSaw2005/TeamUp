package com.teamup.service;

import com.teamup.dto.RatingRequest;
import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.MatchParticipantRepository;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.RatingRepository;
import com.teamup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchParticipantRepository participantRepository;
    private final UserService userService;

    public RatingService(RatingRepository ratingRepository,
                         MatchRepository matchRepository,
                         UserRepository userRepository,
                         MatchParticipantRepository participantRepository,
                         UserService userService) {
        this.ratingRepository = ratingRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.userService = userService;
    }

    @Transactional
    public Rating submitRating(RatingRequest request, User rater) {
        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getStatus() != MatchStatus.COMPLETED) {
            throw new BadRequestException("You can only review players after the match is completed");
        }

        User rated = userRepository.findById(request.getRatedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Rated user not found"));

        if (rater.getId().equals(rated.getId())) {
            throw new BadRequestException("You cannot rate yourself");
        }

        // Validate that both users were approved participants in this match
        MatchParticipant raterPart = participantRepository.findByMatchAndUser(match, rater)
                .orElseThrow(() -> new BadRequestException("You did not participate in this match"));
        MatchParticipant ratedPart = participantRepository.findByMatchAndUser(match, rated)
                .orElseThrow(() -> new BadRequestException("The rated player did not participate in this match"));

        if (raterPart.getStatus() != ParticipantStatus.APPROVED || ratedPart.getStatus() != ParticipantStatus.APPROVED) {
            throw new BadRequestException("Both players must be approved participants of the match to leave ratings");
        }

        Rating rating = new Rating();
        rating.setMatch(match);
        rating.setRater(rater);
        rating.setRated(rated);
        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        Rating saved = ratingRepository.save(rating);

        // Check if recipient qualifies for Superstar Badge
        List<Rating> ratings = ratingRepository.findByRated(rated);
        double avg = ratings.stream().mapToInt(Rating::getRating).average().orElse(0.0);
        if (ratings.size() >= 3 && avg >= 4.7) {
            userService.unlockAchievement(rated, "Superstar", "Maintained an average rating of 4.7+ over at least 3 reviews!");
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Rating> getRatingsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ratingRepository.findByRated(user);
    }
}
