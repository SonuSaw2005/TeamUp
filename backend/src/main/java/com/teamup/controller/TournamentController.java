package com.teamup.controller;

import com.teamup.entity.Tournament;
import com.teamup.entity.TournamentMatch;
import com.teamup.service.TournamentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping
    public ResponseEntity<Tournament> createTournament(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        Long sportId = ((Number) request.get("sportId")).longValue();

        return ResponseEntity.ok(tournamentService.createTournament(name, description, sportId));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/{id}/bracket")
    public ResponseEntity<List<TournamentMatch>> getTournamentBracket(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournamentBracket(id));
    }

    @PostMapping("/{id}/match")
    public ResponseEntity<TournamentMatch> addMatchToTournament(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Long matchId = ((Number) request.get("matchId")).longValue();
        Integer round = (Integer) request.get("round");
        Integer bracketPosition = (Integer) request.get("bracketPosition");

        return ResponseEntity.ok(tournamentService.addMatchToTournament(id, matchId, round, bracketPosition));
    }

    @PostMapping("/match/{tournamentMatchId}/score")
    public ResponseEntity<TournamentMatch> updateScoreAndAdvance(
            @PathVariable Long tournamentMatchId,
            @RequestBody Map<String, Object> request) {
        Integer scoreHome = (Integer) request.get("scoreHome");
        Integer scoreAway = (Integer) request.get("scoreAway");
        Boolean completed = (Boolean) request.get("completed");

        return ResponseEntity.ok(tournamentService.updateScoreAndAdvance(tournamentMatchId, scoreHome, scoreAway, completed));
    }
}
