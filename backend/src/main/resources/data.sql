-- Populate Sports
INSERT INTO sports (id, name, icon_name) VALUES (1, 'Football', 'sports_soccer');
INSERT INTO sports (id, name, icon_name) VALUES (2, 'Basketball', 'sports_basketball');
INSERT INTO sports (id, name, icon_name) VALUES (3, 'Cricket', 'sports_cricket');
INSERT INTO sports (id, name, icon_name) VALUES (4, 'Badminton', 'sports_tennis');
INSERT INTO sports (id, name, icon_name) VALUES (5, 'Tennis', 'sports_tennis');

-- Populate Users (Password is 'password' hashed using BCrypt)
-- Admin User (Id: 1)
INSERT INTO users (id, name, email, password, age, location_name, latitude, longitude, bio, role, is_verified, created_at)
VALUES (1, 'Admin TeamUp', 'admin@teamup.com', '$2a$10$CwTycUXWue0Thq9StjUM0uTYryuhTElB427xT4K4S4Vp9.7pSefeq', 30, 'Indiranagar, Bangalore', 12.9784, 77.6408, 'System Administrator.', 'ADMIN', true, CURRENT_TIMESTAMP);

-- Player 1 (Rahul) (Id: 2)
INSERT INTO users (id, name, email, password, age, location_name, latitude, longitude, bio, role, is_verified, created_at)
VALUES (2, 'Rahul Sharma', 'rahul@teamup.com', '$2a$10$CwTycUXWue0Thq9StjUM0uTYryuhTElB427xT4K4S4Vp9.7pSefeq', 24, 'Koramangala, Bangalore', 12.9352, 77.6245, 'Passionate footballer and cricket fan.', 'USER', true, CURRENT_TIMESTAMP);

-- Player 2 (Amit) (Id: 3)
INSERT INTO users (id, name, email, password, age, location_name, latitude, longitude, bio, role, is_verified, created_at)
VALUES (3, 'Amit Patel', 'amit@teamup.com', '$2a$10$CwTycUXWue0Thq9StjUM0uTYryuhTElB427xT4K4S4Vp9.7pSefeq', 28, 'HSR Layout, Bangalore', 12.9141, 77.6411, 'Weekend basketball player.', 'USER', true, CURRENT_TIMESTAMP);

-- Player 3 (Sneha) (Id: 4)
INSERT INTO users (id, name, email, password, age, location_name, latitude, longitude, bio, role, is_verified, created_at)
VALUES (4, 'Sneha Reddy', 'sneha@teamup.com', '$2a$10$CwTycUXWue0Thq9StjUM0uTYryuhTElB427xT4K4S4Vp9.7pSefeq', 22, 'Whitefield, Bangalore', 12.9698, 77.7499, 'Tennis enthusiast.', 'USER', true, CURRENT_TIMESTAMP);

-- Ground Owner (Turf Boss) (Id: 5)
INSERT INTO users (id, name, email, password, age, location_name, latitude, longitude, bio, role, is_verified, created_at)
VALUES (5, 'Turf Boss Owner', 'owner@teamup.com', '$2a$10$CwTycUXWue0Thq9StjUM0uTYryuhTElB427xT4K4S4Vp9.7pSefeq', 35, 'Sarjapur, Bangalore', 12.9038, 77.6853, 'Ground owner managing Play Arena and local turfs.', 'OWNER', true, CURRENT_TIMESTAMP);

-- Populate Grounds with Owner mapping
INSERT INTO grounds (id, name, address, latitude, longitude, sports_available, contact_number, owner_id, hourly_price, available_slots, cancellation_policy) 
VALUES (1, 'Play Arena Sarjapur', 'Sarjapur Main Road, Bangalore', 12.9038, 77.6853, 'Football, Basketball, Badminton', '+91 9999999901', 5, 1500.0, '06:00-07:00,07:00-08:00,08:00-09:00,16:00-17:00,17:00-18:00,18:00-19:00,19:00-20:00,20:00-21:00', 'Cancel more than 6 hours before match for 100% refund.');

INSERT INTO grounds (id, name, address, latitude, longitude, sports_available, contact_number, owner_id, hourly_price, available_slots, cancellation_policy) 
VALUES (2, 'Bangalore Football Turf', 'Kalyan Nagar, Bangalore', 13.0232, 77.6432, 'Football', '+91 9999999902', 5, 1200.0, '06:00-07:00,17:00-18:00,18:00-19:00,19:00-20:00,20:00-21:00,21:00-22:00', 'Cancel more than 6 hours before match for 100% refund.');

INSERT INTO grounds (id, name, address, latitude, longitude, sports_available, contact_number, owner_id, hourly_price, available_slots, cancellation_policy) 
VALUES (3, 'Decathlon Anubhuti Whitefield', 'Whitefield Main Road, Bangalore', 12.9698, 77.7499, 'Football, Basketball, Tennis', '+91 9999999903', 5, 1000.0, '06:00-07:00,07:00-08:00,08:00-09:00,16:00-17:00,17:00-18:00,18:00-19:00,19:00-20:00', 'Cancel more than 6 hours before match for 100% refund.');

-- Populate Player Trust Scores
INSERT INTO player_trust_scores (id, user_id, matches_played, attendance_percentage, cancellation_percentage, sportsmanship_rating, average_rating)
VALUES (1, 2, 8, 95.0, 12.0, 4.8, 4.7);
INSERT INTO player_trust_scores (id, user_id, matches_played, attendance_percentage, cancellation_percentage, sportsmanship_rating, average_rating)
VALUES (2, 3, 12, 88.0, 8.0, 4.5, 4.4);
INSERT INTO player_trust_scores (id, user_id, matches_played, attendance_percentage, cancellation_percentage, sportsmanship_rating, average_rating)
VALUES (3, 4, 3, 100.0, 0.0, 5.0, 4.9);

-- Map Users to Sports (User Interests)
INSERT INTO user_sports (id, user_id, sport_id, skill_level) VALUES (1, 2, 1, 'ADVANCED');
INSERT INTO user_sports (id, user_id, sport_id, skill_level) VALUES (2, 2, 3, 'INTERMEDIATE');
INSERT INTO user_sports (id, user_id, sport_id, skill_level) VALUES (3, 3, 2, 'INTERMEDIATE');
INSERT INTO user_sports (id, user_id, sport_id, skill_level) VALUES (4, 4, 5, 'BEGINNER');

-- Populate Bookings (Rahul books Ground 1)
INSERT INTO bookings (id, ground_id, captain_id, sport_id, date_time, time_slot, duration_hours, booking_type, status, total_cost, split_cost, min_players, max_players, created_at)
VALUES (1, 1, 2, 1, DATEADD('DAY', 2, CURRENT_TIMESTAMP), '18:00-19:00', 1, 'PUBLIC', 'APPROVED', 1500.0, true, 8, 12, CURRENT_TIMESTAMP);

-- Populate Matches linking to Bookings
INSERT INTO matches (id, title, description, date_time, max_players, status, skill_level_required, creator_id, sport_id, ground_id, booking_id, created_at)
VALUES (1, 'Football Turf Recruitment', 'Need midfielders for a cost-share turf game.', DATEADD('DAY', 2, CURRENT_TIMESTAMP), 12, 'OPEN', 'INTERMEDIATE', 2, 1, 1, 1, CURRENT_TIMESTAMP);

-- Add Match Participants
INSERT INTO match_participants (id, match_id, user_id, status, joined_at) VALUES (1, 1, 2, 'APPROVED', CURRENT_TIMESTAMP);

-- Populate Payments
INSERT INTO payments (id, booking_id, user_id, amount, status, payment_mode, transaction_id, refund_status, updated_at)
VALUES (1, 1, 2, 1500.0, 'PAID', 'UPI', 'TXN-INIT123', 'NONE', CURRENT_TIMESTAMP);

-- Achievements
INSERT INTO user_achievements (id, user_id, badge_name, description, unlocked_at)
VALUES (1, 2, 'Rookie', 'Joined the TeamUp platform!', CURRENT_TIMESTAMP);
INSERT INTO user_achievements (id, user_id, badge_name, description, unlocked_at)
VALUES (2, 3, 'Rookie', 'Joined the TeamUp platform!', CURRENT_TIMESTAMP);
INSERT INTO user_achievements (id, user_id, badge_name, description, unlocked_at)
VALUES (3, 4, 'Rookie', 'Joined the TeamUp platform!', CURRENT_TIMESTAMP);

-- Reset H2 Auto-Increment Identity Sequences
ALTER TABLE users ALTER COLUMN id RESTART WITH 6;
ALTER TABLE grounds ALTER COLUMN id RESTART WITH 4;
ALTER TABLE player_trust_scores ALTER COLUMN id RESTART WITH 4;
ALTER TABLE user_sports ALTER COLUMN id RESTART WITH 5;
ALTER TABLE bookings ALTER COLUMN id RESTART WITH 2;
ALTER TABLE matches ALTER COLUMN id RESTART WITH 2;
ALTER TABLE match_participants ALTER COLUMN id RESTART WITH 2;
ALTER TABLE payments ALTER COLUMN id RESTART WITH 2;
ALTER TABLE user_achievements ALTER COLUMN id RESTART WITH 4;
