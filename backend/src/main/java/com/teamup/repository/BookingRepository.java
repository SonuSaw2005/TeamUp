package com.teamup.repository;

import com.teamup.entity.Booking;
import com.teamup.entity.BookingStatus;
import com.teamup.entity.Ground;
import com.teamup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCaptain(User captain);
    List<Booking> findByGround(Ground ground);
    List<Booking> findByStatus(BookingStatus status);
}
