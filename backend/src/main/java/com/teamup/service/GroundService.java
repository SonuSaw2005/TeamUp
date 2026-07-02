package com.teamup.service;

import com.teamup.entity.Ground;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.GroundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroundService {

    private final GroundRepository groundRepository;

    public GroundService(GroundRepository groundRepository) {
        this.groundRepository = groundRepository;
    }

    @Transactional
    public Ground createGround(Ground ground) {
        return groundRepository.save(ground);
    }

    @Transactional(readOnly = true)
    public List<Ground> getAllGrounds() {
        return groundRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Ground getGroundById(Long id) {
        return groundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ground not found"));
    }

    @Transactional(readOnly = true)
    public List<Ground> findNearbyGrounds(double lat, double lon, double radiusInKm) {
        return groundRepository.findAll().stream()
                .filter(g -> calculateDistance(lat, lon, g.getLatitude(), g.getLongitude()) <= radiusInKm)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
