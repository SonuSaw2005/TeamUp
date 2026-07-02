package com.teamup.repository;

import com.teamup.entity.Match;
import com.teamup.entity.Rating;
import com.teamup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByRated(User rated);
    List<Rating> findByMatch(Match match);
}
