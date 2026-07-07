package com.teamup.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<?> getHomeStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "TeamUp API is online and healthy!",
                "version", "1.0.0"
        ));
    }
}
