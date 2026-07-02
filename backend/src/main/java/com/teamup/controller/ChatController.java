package com.teamup.controller;

import com.teamup.dto.MessageDto;
import com.teamup.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // HTTP Endpoints for pulling chat history
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<MessageDto>> getMatchChatHistory(@PathVariable Long matchId) {
        return ResponseEntity.ok(chatService.getMatchChatHistory(matchId));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<MessageDto>> getTeamChatHistory(@PathVariable Long teamId) {
        return ResponseEntity.ok(chatService.getTeamChatHistory(teamId));
    }

    // WebSocket Endpoint for routing messages
    @MessageMapping("/chat.sendMessage")
    public void receiveWebSocketMessage(@Payload MessageDto messageDto) {
        // Extract sender and route through ChatService
        chatService.sendMessage(messageDto.getSenderId(), messageDto);
    }
}
