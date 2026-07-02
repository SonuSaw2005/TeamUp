package com.teamup.repository;

import com.teamup.entity.Tournament;
import com.teamup.entity.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentOrderByRoundAscBracketPositionAsc(Tournament tournament);
}
