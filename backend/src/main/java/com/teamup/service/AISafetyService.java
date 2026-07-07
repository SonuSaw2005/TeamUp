package com.teamup.service;

import com.teamup.entity.User;
import com.teamup.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AISafetyService {

    private final UserRepository userRepository;

    // Standard list of blocked bad words/abusive terms for simple semantic moderation
    private static final List<String> BLOCKED_WORDS = Arrays.asList(
            "abuse", "spam", "scam", "fake", "idiot", "fraud", "hacker"
    );

    public AISafetyService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ModerationResult moderateText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ModerationResult(true, null);
        }

        String lowerText = text.toLowerCase();

        // 1. Check Bad Words
        for (String word : BLOCKED_WORDS) {
            if (lowerText.contains(word)) {
                return new ModerationResult(false, "Inappropriate content detected: contains flag word '" + word + "'.");
            }
        }

        // 2. Check Spam patterns (multiple URLs or repeat strings)
        if (lowerText.contains("http://") || lowerText.contains("https://") || lowerText.contains("www.")) {
            // Count link links
            int linkCount = 0;
            int index = 0;
            while ((index = lowerText.indexOf("http", index)) != -1) {
                linkCount++;
                index += 4;
            }
            if (linkCount > 1) {
                return new ModerationResult(false, "Spam threshold exceeded: multiple hyperlinks are blocked in chat.");
            }
        }

        return new ModerationResult(true, null);
    }

    public boolean isSuspiciousRegistration(String email, String name) {
        // 1. Check duplicate name / close email matches
        List<User> matches = userRepository.findAll();
        for (User u : matches) {
            if (u.getEmail().equalsIgnoreCase(email)) {
                return true;
            }
            // Check if name is exactly identical and email contains same username part
            if (u.getName().equalsIgnoreCase(name)) {
                String uNamePart = u.getEmail().split("@")[0];
                String emailNamePart = email.split("@")[0];
                if (uNamePart.contains(emailNamePart) || emailNamePart.contains(uNamePart)) {
                    return true; // Suspicious duplicate registration signature
                }
            }
        }
        return false;
    }

    public static class ModerationResult {
        private final boolean clean;
        private final String message;

        public ModerationResult(boolean clean, String message) {
            this.clean = clean;
            this.message = message;
        }

        public boolean isClean() { return clean; }
        public String getMessage() { return message; }
    }
}
