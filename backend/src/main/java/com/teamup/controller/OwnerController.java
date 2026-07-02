package com.teamup.controller;

import com.teamup.entity.Booking;
import com.teamup.entity.BookingStatus;
import com.teamup.entity.Ground;
import com.teamup.entity.User;
import com.teamup.repository.BookingRepository;
import com.teamup.repository.GroundRepository;
import com.teamup.service.BookingService;
import com.teamup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    private final BookingService bookingService;
    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final GroundRepository groundRepository;

    public OwnerController(BookingService bookingService,
                           UserService userService,
                           BookingRepository bookingRepository,
                           GroundRepository groundRepository) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.bookingRepository = bookingRepository;
        this.groundRepository = groundRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    private List<Booking> getOwnerBookings(User owner) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getGround().getOwner() != null && b.getGround().getOwner().getId().equals(owner.getId()))
                .toList();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getMyTurfBookings() {
        User owner = getAuthenticatedUser();
        return ResponseEntity.ok(getOwnerBookings(owner));
    }

    @PostMapping("/bookings/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id) {
        User owner = getAuthenticatedUser();
        bookingService.moderateBookingRequest(id, true, owner);
        return ResponseEntity.ok(Map.of("message", "Booking accepted successfully"));
    }

    @PostMapping("/bookings/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id) {
        User owner = getAuthenticatedUser();
        bookingService.moderateBookingRequest(id, false, owner);
        return ResponseEntity.ok(Map.of("message", "Booking request rejected and payment refunded"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOwnerDashboardStats() {
        User owner = getAuthenticatedUser();
        List<Booking> myBookings = getOwnerBookings(owner);
        LocalDate today = LocalDate.now();

        long todayCount = myBookings.stream()
                .filter(b -> b.getDateTime().toLocalDate().equals(today))
                .count();

        long upcomingCount = myBookings.stream()
                .filter(b -> b.getDateTime().isAfter(LocalDateTime.now()) && b.getStatus() != BookingStatus.CANCELLED)
                .count();

        double revenue = myBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(Booking::getTotalCost)
                .sum();

        long cancelledCount = myBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        // Calculate occupancy rate (occupied slots divided by total configured slots in a week)
        List<Ground> myGrounds = groundRepository.findAll().stream()
                .filter(g -> g.getOwner() != null && g.getOwner().getId().equals(owner.getId()))
                .toList();
        
        int totalSlots = 0;
        for (Ground g : myGrounds) {
            String[] slots = g.getAvailableSlots().split(",");
            totalSlots += slots.length * 7; // Slots per week
        }

        double occupancyRate = totalSlots > 0 ? ((double) (myBookings.size() - cancelledCount) / totalSlots) * 100 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayBookings", todayCount);
        stats.put("upcomingBookings", upcomingCount);
        stats.put("revenue", revenue);
        stats.put("cancelledBookings", cancelledCount);
        stats.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }
}
