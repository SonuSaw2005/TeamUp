package com.teamup.service;

import com.teamup.entity.SkillLevel;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NaturalLanguageSearchService {

    public NLQueryFilters parseQuery(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new NLQueryFilters();
        }

        String lowerQuery = query.toLowerCase().trim();
        NLQueryFilters filters = new NLQueryFilters();

        // 1. Parse Sport Type
        if (lowerQuery.contains("football") || lowerQuery.contains("soccer")) {
            filters.setSport("Football");
        } else if (lowerQuery.contains("cricket")) {
            filters.setSport("Cricket");
        } else if (lowerQuery.contains("basketball")) {
            filters.setSport("Basketball");
        } else if (lowerQuery.contains("badminton")) {
            filters.setSport("Badminton");
        } else if (lowerQuery.contains("tennis")) {
            filters.setSport("Tennis");
        }

        // 2. Parse Skill Level
        if (lowerQuery.contains("beginner") || lowerQuery.contains("rookie") || lowerQuery.contains("easy")) {
            filters.setSkillLevel(SkillLevel.BEGINNER);
        } else if (lowerQuery.contains("intermediate") || lowerQuery.contains("medium")) {
            filters.setSkillLevel(SkillLevel.INTERMEDIATE);
        } else if (lowerQuery.contains("advanced") || lowerQuery.contains("expert") || lowerQuery.contains("pro")) {
            filters.setSkillLevel(SkillLevel.ADVANCED);
        }

        // 3. Parse Distance limits (e.g., "within 5 km", "under 10km")
        Pattern distancePattern = Pattern.compile("(?:within|under|less than|near)\\s*(\\d+)\\s*(?:km|kilometers)?");
        Matcher distanceMatcher = distancePattern.matcher(lowerQuery);
        if (distanceMatcher.find()) {
            try {
                double distance = Double.parseDouble(distanceMatcher.group(1));
                filters.setMaxDistanceKm(distance);
            } catch (NumberFormatException ignored) {}
        } else {
            // Check for simple digit + km (e.g. "5km")
            Pattern simpleKm = Pattern.compile("(\\d+)\\s*km");
            Matcher simpleMatcher = simpleKm.matcher(lowerQuery);
            if (simpleMatcher.find()) {
                try {
                    double distance = Double.parseDouble(simpleMatcher.group(1));
                    filters.setMaxDistanceKm(distance);
                } catch (NumberFormatException ignored) {}
            }
        }

        // 4. Parse Price/Sorting Preferences
        if (lowerQuery.contains("cheapest") || lowerQuery.contains("cheap") || lowerQuery.contains("lowest price") || lowerQuery.contains("budget")) {
            filters.setSortCheapest(true);
        }

        // 5. Parse Time Window
        if (lowerQuery.contains("tomorrow")) {
            filters.setTomorrow(true);
        }
        if (lowerQuery.contains("evening")) {
            filters.setTimeOfDayPreference("evening");
        } else if (lowerQuery.contains("morning")) {
            filters.setTimeOfDayPreference("morning");
        } else if (lowerQuery.contains("afternoon")) {
            filters.setTimeOfDayPreference("afternoon");
        }

        return filters;
    }

    public static class NLQueryFilters {
        private String sport;
        private Double maxDistanceKm;
        private SkillLevel skillLevel;
        private boolean sortCheapest;
        private boolean tomorrow;
        private String timeOfDayPreference; // "morning", "afternoon", "evening"

        // Getters and Setters
        public String getSport() { return sport; }
        public void setSport(String sport) { this.sport = sport; }

        public Double getMaxDistanceKm() { return maxDistanceKm; }
        public void setMaxDistanceKm(Double maxDistanceKm) { this.maxDistanceKm = maxDistanceKm; }

        public SkillLevel getSkillLevel() { return skillLevel; }
        public void setSkillLevel(SkillLevel skillLevel) { this.skillLevel = skillLevel; }

        public boolean isSortCheapest() { return sortCheapest; }
        public void setSortCheapest(boolean sortCheapest) { this.sortCheapest = sortCheapest; }

        public boolean isTomorrow() { return tomorrow; }
        public void setTomorrow(boolean tomorrow) { this.tomorrow = tomorrow; }

        public String getTimeOfDayPreference() { return timeOfDayPreference; }
        public void setTimeOfDayPreference(String timeOfDayPreference) { this.timeOfDayPreference = timeOfDayPreference; }
    }
}
