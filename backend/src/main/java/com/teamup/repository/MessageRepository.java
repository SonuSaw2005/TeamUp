package com.teamup.repository;

import com.teamup.entity.Match;
import com.teamup.entity.Message;
import com.teamup.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByMatchOrderByTimestampAsc(Match match);
    List<Message> findByTeamOrderByTimestampAsc(Team team);
}
