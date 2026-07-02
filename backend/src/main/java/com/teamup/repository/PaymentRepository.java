package com.teamup.repository;

import com.teamup.entity.Booking;
import com.teamup.entity.Payment;
import com.teamup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser(User user);
    List<Payment> findByBooking(Booking booking);
}
