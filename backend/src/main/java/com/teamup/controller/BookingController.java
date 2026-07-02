package com.teamup.controller;

import com.teamup.entity.Booking;
import com.teamup.entity.BookingType;
import com.teamup.entity.Payment;
import com.teamup.entity.User;
import com.teamup.repository.PaymentRepository;
import com.teamup.service.BookingService;
import com.teamup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final PaymentRepository paymentRepository;

    public BookingController(BookingService bookingService,
                             UserService userService,
                             PaymentRepository paymentRepository) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.paymentRepository = paymentRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Map<String, Object> request) {
        User captain = getAuthenticatedUser();
        Long groundId = ((Number) request.get("groundId")).longValue();
        Long sportId = ((Number) request.get("sportId")).longValue();
        LocalDateTime dateTime = LocalDateTime.parse((String) request.get("dateTime"));
        String timeSlot = (String) request.get("timeSlot");
        Integer durationHours = (Integer) request.get("durationHours");
        BookingType bookingType = BookingType.valueOf((String) request.get("bookingType"));
        Boolean splitCost = (Boolean) request.get("splitCost");
        Integer minPlayers = (Integer) request.get("minPlayers");
        Integer maxPlayers = (Integer) request.get("maxPlayers");

        Booking booking = bookingService.createBooking(
                groundId, sportId, dateTime, timeSlot, durationHours, bookingType, splitCost, minPlayers, maxPlayers, captain
        );
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        bookingService.cancelBooking(id, user);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled. Refunds processed."));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getMyPaymentHistory() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(paymentRepository.findByUser(user));
    }

    @GetMapping("/{bookingId}/payments")
    public ResponseEntity<List<Payment>> getBookingPayments(@PathVariable Long bookingId) {
        // Query payments by booking
        Booking booking = new Booking();
        booking.setId(bookingId);
        return ResponseEntity.ok(paymentRepository.findByBooking(booking));
    }
}
