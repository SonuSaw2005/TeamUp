package com.teamup.service;

import com.teamup.dto.MatchRequest;
import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository participantRepository;
    private final SportRepository sportRepository;
    private final GroundRepository groundRepository;
    private final NotificationService notificationService;
    private final UserService userService;
    private final BookingService bookingService;
    private final TrustScoreService trustScoreService;

    public MatchService(MatchRepository matchRepository,
                        MatchParticipantRepository participantRepository,
                        SportRepository sportRepository,
                        GroundRepository groundRepository,
                        NotificationService notificationService,
                        UserService userService,
                        @Lazy BookingService bookingService,
                        TrustScoreService trustScoreService) {
        this.matchRepository = matchRepository;
        this.participantRepository = participantRepository;
        this.sportRepository = sportRepository;
        this.groundRepository = groundRepository;
        this.notificationService = notificationService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.trustScoreService = trustScoreService;
    }

    @Transactional
    public Match createMatch(MatchRequest request, User creator) {
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        Ground ground = groundRepository.findById(request.getGroundId())
                .orElseThrow(() -> new ResourceNotFoundException("Ground not found"));

        Match match = new Match();
        match.setTitle(request.getTitle());
        match.setDescription(request.getDescription());
        match.setDateTime(request.getDateTime());
        match.setMaxPlayers(request.getMaxPlayers());
        match.setSport(sport);
        match.setGround(ground);
        match.setSkillLevelRequired(request.getSkillLevelRequired());
        match.setCreator(creator);
        match.setStatus(MatchStatus.OPEN);

        Match savedMatch = matchRepository.save(match);

        // Add creator as approved participant automatically
        MatchParticipant creatorParticipant = new MatchParticipant(savedMatch, creator, ParticipantStatus.APPROVED);
        participantRepository.save(creatorParticipant);

        // Award badge to host
        userService.unlockAchievement(creator, "Organizer", "Hosted a sports match!");

        return savedMatch;
    }

    @Transactional
    public Match updateMatch(Long id, MatchRequest request, User user) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to edit this match");
        }

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        Ground ground = groundRepository.findById(request.getGroundId())
                .orElseThrow(() -> new ResourceNotFoundException("Ground not found"));

        match.setTitle(request.getTitle());
        match.setDescription(request.getDescription());
        match.setDateTime(request.getDateTime());
        match.setMaxPlayers(request.getMaxPlayers());
        match.setSport(sport);
        match.setGround(ground);
        match.setSkillLevelRequired(request.getSkillLevelRequired());

        // Notify participants
        List<MatchParticipant> participants = participantRepository.findByMatch(match);
        for (MatchParticipant p : participants) {
            if (p.getStatus() == ParticipantStatus.APPROVED && !p.getUser().getId().equals(user.getId())) {
                notificationService.sendNotification(
                    p.getUser(),
                    NotificationType.MATCH_UPDATE,
                    "Match '" + match.getTitle() + "' has been updated.",
                    "/matches/" + match.getId()
                );
            }
        }

        return matchRepository.save(match);
    }

    @Transactional
    public void deleteMatch(Long id, User user) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to delete this match");
        }

        matchRepository.delete(match);
    }

    @Transactional
    public void joinMatch(Long matchId, User user) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getStatus() == MatchStatus.CANCELLED || match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Cannot join an inactive match");
        }

        if (participantRepository.findByMatchAndUser(match, user).isPresent()) {
            throw new BadRequestException("You have already requested to join or are in this match");
        }

        long approvedCount = participantRepository.countByMatchAndStatus(match, ParticipantStatus.APPROVED);
        if (approvedCount >= match.getMaxPlayers()) {
            throw new BadRequestException("Match is already full");
        }

        MatchParticipant participant = new MatchParticipant(match, user, ParticipantStatus.PENDING);
        participantRepository.save(participant);

        // Notify Creator
        notificationService.sendNotification(
            match.getCreator(),
            NotificationType.MATCH_INVITE,
            user.getName() + " requested to join your match '" + match.getTitle() + "'.",
            "/matches/" + match.getId()
        );
    }

    @Transactional
    public void leaveMatch(Long matchId, User user) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        MatchParticipant participant = participantRepository.findByMatchAndUser(match, user)
                .orElseThrow(() -> new BadRequestException("You are not a participant in this match"));

        participantRepository.delete(participant);

        // Update booking cost share if user leaves
        if (match.getBooking() != null) {
            bookingService.updateSplitCost(match.getBooking());
        }

        // If the match was FULL, it should revert back to OPEN since someone left
        if (match.getStatus() == MatchStatus.FULL) {
            match.setStatus(MatchStatus.OPEN);
            matchRepository.save(match);
        }

        // Notify Creator
        if (!match.getCreator().getId().equals(user.getId())) {
            notificationService.sendNotification(
                match.getCreator(),
                NotificationType.MATCH_UPDATE,
                user.getName() + " left your match '" + match.getTitle() + "'.",
                "/matches/" + match.getId()
            );
        }
    }

    @Transactional
    public void approveParticipant(Long matchId, Long userId, User creator, boolean approve) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getCreator().getId().equals(creator.getId()) && creator.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to approve participants for this match");
        }

        User player = userService.getUserById(userId);
        MatchParticipant participant = participantRepository.findByMatchAndUser(match, player)
                .orElseThrow(() -> new ResourceNotFoundException("Participant request not found"));

        if (approve) {
            long approvedCount = participantRepository.countByMatchAndStatus(match, ParticipantStatus.APPROVED);
            if (approvedCount >= match.getMaxPlayers()) {
                throw new BadRequestException("Match is already full");
            }

            participant.setStatus(ParticipantStatus.APPROVED);
            participantRepository.save(participant);

            // Trigger Cost Sharing Update
            if (match.getBooking() != null) {
                bookingService.updateSplitCost(match.getBooking());
            }

            // Increment count and check if full
            if (approvedCount + 1 >= match.getMaxPlayers()) {
                match.setStatus(MatchStatus.FULL);
                matchRepository.save(match);
            }

            notificationService.sendNotification(
                player,
                NotificationType.MATCH_APPROVAL,
                "Your request to join '" + match.getTitle() + "' was approved!",
                "/matches/" + match.getId()
            );

            // Unlock badge for first join
            userService.unlockAchievement(player, "Athlete", "Joined your first sports match!");

        } else {
            participant.setStatus(ParticipantStatus.REJECTED);
            participantRepository.save(participant);

            notificationService.sendNotification(
                player,
                NotificationType.MATCH_REJECTION,
                "Your request to join '" + match.getTitle() + "' was rejected.",
                "/matches/" + match.getId()
            );
        }
    }

    @Transactional
    public void completeMatch(Long id, User user) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to complete this match");
        }

        match.setStatus(MatchStatus.COMPLETED);
        matchRepository.save(match);

        if (match.getBooking() != null) {
            match.getBooking().setStatus(BookingStatus.COMPLETED);
        }

        // Notify participants and award active player badge
        List<MatchParticipant> participants = participantRepository.findByMatch(match);
        for (MatchParticipant p : participants) {
            if (p.getStatus() == ParticipantStatus.APPROVED) {
                // Record attendance in player trust score
                trustScoreService.recordMatchPlayed(p.getUser(), true);

                notificationService.sendNotification(
                    p.getUser(),
                    NotificationType.MATCH_UPDATE,
                    "Match '" + match.getTitle() + "' is completed! Please rate your teammates.",
                    "/matches/" + match.getId()
                );

                // Give credit toward matches completed
                List<MatchParticipant> completedMatches = participantRepository.findByUser(p.getUser()).stream()
                        .filter(mp -> mp.getStatus() == ParticipantStatus.APPROVED && mp.getMatch().getStatus() == MatchStatus.COMPLETED)
                        .collect(Collectors.toList());

                if (completedMatches.size() >= 5) {
                    userService.unlockAchievement(p.getUser(), "Veteran", "Completed 5 matches on TeamUp!");
                }
            }
        }
    }

    @Transactional
    public void cancelMatch(Long id, User user) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getBooking() != null) {
            // Cancel booking via BookingService (re-routes refunds and cancellation policy checks)
            bookingService.cancelBooking(match.getBooking().getId(), user);
            return;
        }

        if (!match.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this match");
        }

        match.setStatus(MatchStatus.CANCELLED);
        matchRepository.save(match);

        // Notify participants
        List<MatchParticipant> participants = participantRepository.findByMatch(match);
        for (MatchParticipant p : participants) {
            if (p.getStatus() == ParticipantStatus.APPROVED && !p.getUser().getId().equals(user.getId())) {
                notificationService.sendNotification(
                    p.getUser(),
                    NotificationType.MATCH_CANCEL,
                    "Match '" + match.getTitle() + "' has been cancelled by the host.",
                    "/matches/" + match.getId()
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Match> browseMatches(Long sportId, SkillLevel skillLevel, MatchStatus status, Double userLat, Double userLon, Double radiusInKm) {
        Specification<Match> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }
            if (skillLevel != null) {
                predicates.add(cb.equal(root.get("skillLevelRequired"), skillLevel));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Match> matches = matchRepository.findAll(spec);

        // Optional Location Radius Filter using Haversine
        if (userLat != null && userLon != null && radiusInKm != null) {
            return matches.stream()
                    .filter(m -> m.getGround() != null)
                    .filter(m -> calculateDistance(userLat, userLon, m.getGround().getLatitude(), m.getGround().getLongitude()) <= radiusInKm)
                    .collect(Collectors.toList());
        }

        return matches;
    }

    @Transactional(readOnly = true)
    public List<MatchParticipant> getMatchParticipants(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        return participantRepository.findByMatch(match);
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
}
