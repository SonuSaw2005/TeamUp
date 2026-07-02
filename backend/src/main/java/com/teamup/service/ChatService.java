package com.teamup.service;

import com.teamup.dto.MessageDto;
import com.teamup.entity.Match;
import com.teamup.entity.Message;
import com.teamup.entity.Team;
import com.teamup.entity.User;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.MatchRepository;
import com.teamup.repository.MessageRepository;
import com.teamup.repository.TeamRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(MessageRepository messageRepository,
                       MatchRepository matchRepository,
                       TeamRepository teamRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, MessageDto request) {
        User sender = new User();
        sender.setId(senderId); // Avoid DB hit if we just need FK mapping

        Message message = new Message();
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());

        if (request.getMatchId() != null) {
            Match match = matchRepository.findById(request.getMatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
            message.setMatch(match);
        } else if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            message.setTeam(team);
        } else {
            throw new IllegalArgumentException("Message must target either a Match or a Team");
        }

        Message saved = messageRepository.save(message);

        // Populate details for WS payload
        MessageDto payload = new MessageDto(
                saved.getId(),
                senderId,
                request.getSenderName(),
                request.getMatchId(),
                request.getTeamId(),
                saved.getContent(),
                saved.getTimestamp()
        );

        // Broadcast to WebSocket broker channel
        if (request.getMatchId() != null) {
            messagingTemplate.convertAndSend("/topic/match/" + request.getMatchId(), payload);
        } else {
            messagingTemplate.convertAndSend("/topic/team/" + request.getTeamId(), payload);
        }

        return payload;
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMatchChatHistory(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        return messageRepository.findByMatchOrderByTimestampAsc(match).stream()
                .map(m -> new MessageDto(
                        m.getId(),
                        m.getSender().getId(),
                        m.getSender().getName(),
                        matchId,
                        null,
                        m.getContent(),
                        m.getTimestamp()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getTeamChatHistory(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        return messageRepository.findByTeamOrderByTimestampAsc(team).stream()
                .map(m -> new MessageDto(
                        m.getId(),
                        m.getSender().getId(),
                        m.getSender().getName(),
                        null,
                        teamId,
                        m.getContent(),
                        m.getTimestamp()
                ))
                .collect(Collectors.toList());
    }
}
