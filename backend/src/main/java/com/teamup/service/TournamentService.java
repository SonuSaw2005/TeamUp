package com.teamup.service;

import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.SportRepository;
import com.teamup.repository.TournamentMatchRepository;
import com.teamup.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final SportRepository sportRepository;
    private final MatchRepository matchRepository;

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentMatchRepository tournamentMatchRepository,
                             SportRepository sportRepository,
                             MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.sportRepository = sportRepository;
        this.matchRepository = matchRepository;
    }

    @Transactional
    public Tournament createTournament(String name, String description, Long sportId) {
        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));

        Tournament tournament = new Tournament();
        tournament.setName(name);
        tournament.setDescription(description);
        tournament.setSport(sport);
        tournament.setStatus(TournamentStatus.UPCOMING);

        return tournamentRepository.save(tournament);
    }

    @Transactional
    public TournamentMatch addMatchToTournament(Long tournamentId, Long matchId, Integer round, Integer bracketPosition) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        TournamentMatch tournamentMatch = new TournamentMatch();
        tournamentMatch.setTournament(tournament);
        tournamentMatch.setMatch(match);
        tournamentMatch.setRound(round);
        tournamentMatch.setBracketPosition(bracketPosition);

        return tournamentMatchRepository.save(tournamentMatch);
    }

    @Transactional
    public TournamentMatch updateScoreAndAdvance(Long tournamentMatchId, Integer scoreHome, Integer scoreAway, boolean markCompleted) {
        TournamentMatch currentMatch = tournamentMatchRepository.findById(tournamentMatchId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament Match not found"));

        currentMatch.setScoreHome(scoreHome);
        currentMatch.setScoreAway(scoreAway);

        if (markCompleted) {
            Match match = currentMatch.getMatch();
            match.setStatus(MatchStatus.COMPLETED);
            matchRepository.save(match);

            // Advance winner logic
            // Single elimination: next round = round + 1, position = currentPosition / 2
            int nextRound = currentMatch.getRound() + 1;
            int nextPosition = currentMatch.getBracketPosition() / 2;

            List<TournamentMatch> allMatches = tournamentMatchRepository
                    .findByTournamentOrderByRoundAscBracketPositionAsc(currentMatch.getTournament());

            TournamentMatch nextMatch = allMatches.stream()
                    .filter(m -> m.getRound() == nextRound && m.getBracketPosition() == nextPosition)
                    .findFirst()
                    .orElse(null);

            if (nextMatch != null) {
                // Determine Winner (in simple context, home/away represent participants)
                User winner = (scoreHome > scoreAway) ? match.getCreator() : null; 
                // In a production app, we would fetch the approved participants and match them.
                // For this platform, we log the result in the bracket and let organizers schedule the winner match.
            }

            // Check if this was the last round (Finals) to complete the tournament
            long activeRoundsMatches = allMatches.stream()
                    .filter(m -> m.getRound().equals(currentMatch.getRound()) && m.getMatch().getStatus() != MatchStatus.COMPLETED)
                    .count();
            
            if (activeRoundsMatches == 0) {
                // If all matches in this round are done, check if it's the finals
                boolean isFinals = allMatches.stream().noneMatch(m -> m.getRound() > currentMatch.getRound());
                if (isFinals) {
                    currentMatch.getTournament().setStatus(TournamentStatus.COMPLETED);
                    tournamentRepository.save(currentMatch.getTournament());
                } else {
                    currentMatch.getTournament().setStatus(TournamentStatus.ACTIVE);
                    tournamentRepository.save(currentMatch.getTournament());
                }
            }
        }

        return tournamentMatchRepository.save(currentMatch);
    }

    @Transactional(readOnly = true)
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TournamentMatch> getTournamentBracket(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        return tournamentMatchRepository.findByTournamentOrderByRoundAscBracketPositionAsc(tournament);
    }
}
