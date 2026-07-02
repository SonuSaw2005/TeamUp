package com.teamup.service;

import com.teamup.entity.Match;
import com.teamup.entity.MatchParticipant;
import com.teamup.entity.NotificationType;
import com.teamup.entity.ParticipantStatus;
import com.teamup.repository.MatchParticipantRepository;
import com.teamup.repository.MatchRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class MatchReminderScheduler {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository participantRepository;
    private final NotificationService notificationService;

    public MatchReminderScheduler(MatchRepository matchRepository,
                                  MatchParticipantRepository participantRepository,
                                  NotificationService notificationService) {
        this.matchRepository = matchRepository;
        this.participantRepository = participantRepository;
        this.notificationService = notificationService;
    }

    // Run every hour to check upcoming matches in the next 24 hours
    @Scheduled(cron = "0 0 * * * *")
    public void sendUpcomingMatchReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusHours(24);

        List<Match> upcomingMatches = matchRepository.findAll().stream()
                .filter(m -> m.getDateTime().isAfter(now) && m.getDateTime().isBefore(threshold))
                .toList();

        for (Match match : upcomingMatches) {
            List<MatchParticipant> participants = participantRepository.findByMatch(match);
            for (MatchParticipant p : participants) {
                if (p.getStatus() == ParticipantStatus.APPROVED) {
                    notificationService.sendNotification(
                        p.getUser(),
                        NotificationType.MATCH_REMINDER,
                        "Reminder: Your match '" + match.getTitle() + "' is scheduled for " + match.getDateTime(),
                        "/matches/" + match.getId()
                    );
                }
            }
        }
    }
}
