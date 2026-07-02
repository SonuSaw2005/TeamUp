package com.teamup.repository;

import com.teamup.entity.PlayerTrustScore;
import com.teamup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerTrustScoreRepository extends JpaRepository<PlayerTrustScore, Long> {
    Optional<PlayerTrustScore> findByUser(User user);
}
