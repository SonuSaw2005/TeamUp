package com.teamup.service;

import com.teamup.dto.TeamRequest;
import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.SportRepository;
import com.teamup.repository.TeamMemberRepository;
import com.teamup.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final SportRepository sportRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       SportRepository sportRepository,
                       NotificationService notificationService,
                       UserService userService) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.sportRepository = sportRepository;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @Transactional
    public Team createTeam(TeamRequest request, User creator) {
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setSport(sport);
        team.setCreator(creator);

        Team savedTeam = teamRepository.save(team);

        // Add creator as Team Captain / Leader
        TeamMember captain = new TeamMember(savedTeam, creator, TeamRole.CREATOR);
        teamMemberRepository.save(captain);

        // Unlock Captain badge
        userService.unlockAchievement(creator, "Captain", "Formed your first sports team!");

        return savedTeam;
    }

    @Transactional
    public void joinTeam(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (teamMemberRepository.findByTeamAndUser(team, user).isPresent()) {
            throw new BadRequestException("You are already a member of this team");
        }

        TeamMember member = new TeamMember(team, user, TeamRole.MEMBER);
        teamMemberRepository.save(member);

        // Notify Creator/Captain
        notificationService.sendNotification(
            team.getCreator(),
            NotificationType.TEAM_JOIN,
            user.getName() + " joined your team '" + team.getName() + "'.",
            "/teams/" + team.getId()
        );
    }

    @Transactional
    public void leaveTeam(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        TeamMember member = teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

        if (member.getRole() == TeamRole.CREATOR) {
            throw new BadRequestException("Captain cannot leave without deleting or transfering leadership first");
        }

        teamMemberRepository.delete(member);

        // Notify Captain
        notificationService.sendNotification(
            team.getCreator(),
            NotificationType.TEAM_JOIN,
            user.getName() + " left your team '" + team.getName() + "'.",
            "/teams/" + team.getId()
        );
    }

    @Transactional(readOnly = true)
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    @Transactional(readOnly = true)
    public List<TeamMember> getTeamMembers(Long teamId) {
        Team team = getTeamById(teamId);
        return teamMemberRepository.findByTeam(team);
    }
}
