package com.teamup.service;

import com.teamup.entity.*;
import com.teamup.exception.BadRequestException;
import com.teamup.exception.ResourceNotFoundException;
import com.teamup.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final GroundRepository groundRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository participantRepository;
    private final SportRepository sportRepository;
    private final NotificationService notificationService;
    private final TrustScoreService trustScoreService;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          PaymentRepository paymentRepository,
                          GroundRepository groundRepository,
                          MatchRepository matchRepository,
                          MatchParticipantRepository participantRepository,
                          SportRepository sportRepository,
                          NotificationService notificationService,
                          TrustScoreService trustScoreService,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.groundRepository = groundRepository;
        this.matchRepository = matchRepository;
        this.participantRepository = participantRepository;
        this.sportRepository = sportRepository;
        this.notificationService = notificationService;
        this.trustScoreService = trustScoreService;
        this.userRepository = userRepository;
    }

    @Transactional
    public Booking createBooking(Long groundId, Long sportId, LocalDateTime dateTime, String timeSlot, 
                                 Integer durationHours, BookingType bookingType, Boolean splitCost,
                                 Integer minPlayers, Integer maxPlayers, User captain) {
        
        Ground ground = groundRepository.findById(groundId)
                .orElseThrow(() -> new ResourceNotFoundException("Ground not found"));
        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));

        // 1. Availability validation
        List<Booking> activeBookings = bookingRepository.findByGround(ground).stream()
                .filter(b -> b.getDateTime().toLocalDate().equals(dateTime.toLocalDate()))
                .filter(b -> b.getTimeSlot().equalsIgnoreCase(timeSlot))
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .toList();

        if (!activeBookings.isEmpty()) {
            throw new BadRequestException("This time slot is already booked for this turf.");
        }

        // 2. Pricing math
        double totalCost = ground.getHourlyPrice() * durationHours;

        Booking booking = new Booking();
        booking.setGround(ground);
        booking.setCaptain(captain);
        booking.setSport(sport);
        booking.setDateTime(dateTime);
        booking.setTimeSlot(timeSlot);
        booking.setDurationHours(durationHours);
        booking.setBookingType(bookingType);
        booking.setStatus(BookingStatus.PENDING); // Ground Owner needs to accept
        booking.setTotalCost(totalCost);
        booking.setSplitCost(splitCost);
        booking.setMinPlayers(minPlayers);
        booking.setMaxPlayers(maxPlayers);

        Booking savedBooking = bookingRepository.save(booking);

        // 3. Simulated Payment setup
        double captainShare = splitCost ? (totalCost / maxPlayers) : totalCost;
        Payment payment = new Payment(
                savedBooking,
                captain,
                captainShare,
                PaymentStatus.PAID,
                PaymentMode.UPI,
                "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        );
        paymentRepository.save(payment);

        // 4. Match Scheduling (if Public or Friends First)
        if (bookingType != BookingType.PRIVATE) {
            Match match = new Match();
            match.setTitle(sport.getName() + " Turf Match @ " + ground.getName());
            match.setDescription("Turf match booked by captain " + captain.getName() + ". Cost-sharing split active.");
            match.setDateTime(dateTime);
            match.setMaxPlayers(maxPlayers);
            match.setSport(sport);
            match.setGround(ground);
            match.setBooking(savedBooking);
            match.setCreator(captain);
            match.setStatus(MatchStatus.OPEN);

            Match savedMatch = matchRepository.save(match);

            // Add Captain as approved participant
            MatchParticipant captainPart = new MatchParticipant(savedMatch, captain, ParticipantStatus.APPROVED);
            participantRepository.save(captainPart);
        }

        // Notify ground owner
        if (ground.getOwner() != null) {
            notificationService.sendNotification(
                    ground.getOwner(),
                    NotificationType.MATCH_INVITE,
                    "New turf booking request received for " + ground.getName() + " on " + dateTime.toLocalDate() + " slot " + timeSlot,
                    "/admin/bookings"
            );
        }

        return savedBooking;
    }

    @Transactional
    public void updateSplitCost(Booking booking) {
        if (!booking.getSplitCost()) return;

        // Find match linked to this booking
        Match match = matchRepository.findAll().stream()
                .filter(m -> m.getBooking() != null && m.getBooking().getId().equals(booking.getId()))
                .findFirst()
                .orElse(null);

        if (match == null) return;

        List<MatchParticipant> approvedParticipants = participantRepository.findByMatch(match).stream()
                .filter(p -> p.getStatus() == ParticipantStatus.APPROVED)
                .toList();

        int count = Math.max(1, approvedParticipants.size());
        double perPlayerCost = booking.getTotalCost() / count;

        // Fetch existing payments
        List<Payment> payments = paymentRepository.findByBooking(booking);

        for (MatchParticipant p : approvedParticipants) {
            Payment userPayment = payments.stream()
                    .filter(pay -> pay.getUser().getId().equals(p.getUser().getId()))
                    .findFirst()
                    .orElse(null);

            if (userPayment != null) {
                userPayment.setAmount(perPlayerCost);
                paymentRepository.save(userPayment);
            } else {
                // Generate missing player transaction share
                Payment newPayment = new Payment(
                        booking,
                        p.getUser(),
                        perPlayerCost,
                        PaymentStatus.PAID,
                        PaymentMode.UPI,
                        "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
                );
                paymentRepository.save(newPayment);
            }
        }

        // Any user who left has their payment refunded
        List<Long> approvedUserIds = approvedParticipants.stream().map(ap -> ap.getUser().getId()).toList();
        for (Payment pay : payments) {
            if (!approvedUserIds.contains(pay.getUser().getId())) {
                pay.setStatus(PaymentStatus.REFUNDED);
                pay.setRefundStatus("COMPLETED");
                paymentRepository.save(pay);
            }
        }
    }

    @Transactional
    public void cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCaptain().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this booking.");
        }

        // Check cancellation policy (default: >6 hours before match)
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(now, booking.getDateTime());
        long hours = duration.toHours();

        if (hours < 6) {
            throw new BadRequestException("Booking locked. Cancellations are only allowed more than 6 hours before play.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Cancel associated match
        matchRepository.findAll().stream()
                .filter(m -> m.getBooking() != null && m.getBooking().getId().equals(bookingId))
                .forEach(m -> {
                    m.setStatus(MatchStatus.CANCELLED);
                    matchRepository.save(m);
                });

        // Trigger refunds for all payments
        List<Payment> payments = paymentRepository.findByBooking(booking);
        for (Payment p : payments) {
            p.setStatus(PaymentStatus.REFUNDED);
            p.setRefundStatus("COMPLETED");
            paymentRepository.save(p);

            // Notify player
            notificationService.sendNotification(
                    p.getUser(),
                    NotificationType.MATCH_CANCEL,
                    "Booking cancelled for match at " + booking.getGround().getName() + ". 100% refund has been processed.",
                    "/dashboard"
            );
        }

        // Log cancellation in captain trust score
        trustScoreService.recordBookingCancellation(booking.getCaptain(), true);
    }

    @Transactional
    public void moderateBookingRequest(Long bookingId, boolean accept, User owner) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getGround().getOwner().getId().equals(owner.getId()) && owner.getRole() != Role.ADMIN) {
            throw new BadRequestException("You do not own this ground.");
        }

        if (accept) {
            booking.setStatus(BookingStatus.APPROVED);
        } else {
            booking.setStatus(BookingStatus.REJECTED);
            // Refund Captain
            List<Payment> payments = paymentRepository.findByBooking(booking);
            for (Payment p : payments) {
                p.setStatus(PaymentStatus.REFUNDED);
                p.setRefundStatus("COMPLETED");
                paymentRepository.save(p);
            }
        }
        bookingRepository.save(booking);

        // Notify Captain
        notificationService.sendNotification(
                booking.getCaptain(),
                NotificationType.MATCH_APPROVAL,
                "Your booking request for " + booking.getGround().getName() + " was " + (accept ? "APPROVED" : "REJECTED") + " by the owner.",
                "/dashboard"
        );
    }

    // Confirmation Deadline Task: Runs hourly.
    // Checks matches starting in exactly 6 hours.
    // If minimum players are not reached, captain is alerted to cancel or proceed with fewer players.
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkConfirmationDeadlines() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING);

        for (Booking booking : pendingBookings) {
            Duration duration = Duration.between(now, booking.getDateTime());
            long hours = duration.toHours();

            if (hours <= 6 && hours > 4) { // within confirmation window
                // Count approved players
                Match match = matchRepository.findAll().stream()
                        .filter(m -> m.getBooking() != null && m.getBooking().getId().equals(booking.getId()))
                        .findFirst()
                        .orElse(null);

                if (match != null) {
                    long approvedPlayers = participantRepository.countByMatchAndStatus(match, ParticipantStatus.APPROVED);
                    if (approvedPlayers < booking.getMinPlayers()) {
                        // Warn Captain
                        notificationService.sendNotification(
                                booking.getCaptain(),
                                NotificationType.MATCH_REMINDER,
                                "Alert: Booking confirmation deadline reached for " + booking.getGround().getName() + ". Minimum players not met. Choose to cancel or proceed.",
                                "/matches/" + match.getId()
                        );

                        // If Friends First mode, automatically convert remaining slots to public
                        if (booking.getBookingType() == BookingType.FRIENDS_FIRST) {
                            booking.setBookingType(BookingType.PUBLIC);
                            bookingRepository.save(booking);
                            match.setDescription("🚨 Match open to public! Need players to meet booking minimum quota.");
                            matchRepository.save(match);
                        }
                    } else {
                        // Automatically approve/confirm booking if owner hadn't done so, or mark ready
                        booking.setStatus(BookingStatus.APPROVED);
                        bookingRepository.save(booking);
                    }
                }
            }
        }
    }

    // Emergency player promoter scheduler
    // Runs every 15 minutes. Finds public matches starting today that still need players.
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void promoteUrgentMatches() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusHours(8); // Starting in next 8 hours

        List<Match> urgentMatches = matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchStatus.OPEN && m.getBooking() != null)
                .filter(m -> m.getDateTime().isAfter(now) && m.getDateTime().isBefore(threshold))
                .toList();

        for (Match match : urgentMatches) {
            long approvedCount = participantRepository.countByMatchAndStatus(match, ParticipantStatus.APPROVED);
            if (approvedCount < match.getMaxPlayers()) {
                // Promote match in notification feed
                List<User> nearbyUsers = userRepository.findAll().stream()
                        .filter(u -> !u.getId().equals(match.getCreator().getId()))
                        .filter(u -> calculateDistance(u.getLatitude(), u.getLongitude(), match.getGround().getLatitude(), match.getGround().getLongitude()) <= 15.0)
                        .toList();

                for (User u : nearbyUsers) {
                    notificationService.sendNotification(
                            u,
                            NotificationType.MATCH_REMINDER,
                            "🔥 Urgent Match: Play " + match.getSport().getName() + " today at " + match.getGround().getName() + "! Needs players.",
                            "/matches/" + match.getId()
                    );
                }
            }
        }
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

    @Transactional(readOnly = true)
    public List<Booking> getMyBookings(User user) {
        return bookingRepository.findByCaptain(user);
    }
}
