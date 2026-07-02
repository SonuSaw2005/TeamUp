package com.teamup.repository;

import com.teamup.entity.Match;
import com.teamup.entity.MatchParticipant;
import com.teamup.entity.ParticipantStatus;
import com.teamup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {
    List<MatchParticipant> findByMatch(Match match);
    List<MatchParticipant> findByUser(User user);
    Optional<MatchParticipant> findByMatchAndUser(Match match, User user);
    long countByMatchAndStatus(Match match, ParticipantStatus status);
}
