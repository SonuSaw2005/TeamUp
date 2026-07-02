package com.teamup.repository;

import com.teamup.entity.User;
import com.teamup.entity.UserSport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSportRepository extends JpaRepository<UserSport, Long> {
    List<UserSport> findByUser(User user);
    void deleteByUser(User user);
}
