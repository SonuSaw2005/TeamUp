package com.teamup.controller;

import com.teamup.entity.Ground;
import com.teamup.service.GroundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grounds")
public class GroundController {

    private final GroundService groundService;

    public GroundController(GroundService groundService) {
        this.groundService = groundService;
    }

    @PostMapping
    public ResponseEntity<Ground> createGround(@RequestBody Ground ground) {
        return ResponseEntity.ok(groundService.createGround(ground));
    }

    @GetMapping
    public ResponseEntity<List<Ground>> getAllGrounds() {
        return ResponseEntity.ok(groundService.getAllGrounds());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Ground>> getNearbyGrounds(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10.0") double radius) {
        return ResponseEntity.ok(groundService.findNearbyGrounds(lat, lon, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ground> getGroundById(@PathVariable Long id) {
        return ResponseEntity.ok(groundService.getGroundById(id));
    }
}
