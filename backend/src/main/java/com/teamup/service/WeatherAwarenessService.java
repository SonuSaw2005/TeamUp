package com.teamup.service;

import com.teamup.entity.Match;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class WeatherAwarenessService {

    private final Random random = new Random();

    public WeatherReport checkMatchWeather(Match match) {
        if (match == null || match.getGround() == null) {
            return new WeatherReport("Sunny", 10.0, 28.0, false, null);
        }

        // Check if the ground sports list implies outdoor vs indoor
        String sports = match.getGround().getSportsAvailable().toLowerCase();
        boolean isOutdoorType = sports.contains("football") || sports.contains("cricket");

        // Seed with match ID so the forecast is deterministic for each match
        random.setSeed(match.getId());
        double rainProbability = random.nextDouble() * 100.0;
        double temperature = 18.0 + (random.nextDouble() * 15.0); // 18C - 33C
        
        String condition = "Sunny";
        if (rainProbability > 80.0) {
            condition = "Heavy Storm";
        } else if (rainProbability > 50.0) {
            condition = "Scattered Showers";
        } else if (rainProbability > 25.0) {
            condition = "Partly Cloudy";
        }

        boolean warningActive = isOutdoorType && (rainProbability > 65.0);
        String recommendation = null;
        if (warningActive) {
            recommendation = "Heavy rain expected (" + (int)rainProbability + "% probability). We recommend contacting the ground owner (" + match.getGround().getContactNumber() + ") to reschedule or request moving to an indoor court option.";
        }

        return new WeatherReport(
                condition,
                Math.round(rainProbability * 10.0) / 10.0,
                Math.round(temperature * 10.0) / 10.0,
                warningActive,
                recommendation
        );
    }

    public static class WeatherReport {
        private String condition;
        private double rainProbability;
        private double temperatureCelsius;
        private boolean warningActive;
        private String recommendation;

        public WeatherReport(String condition, double rainProbability, double temperatureCelsius, boolean warningActive, String recommendation) {
            this.condition = condition;
            this.rainProbability = rainProbability;
            this.temperatureCelsius = temperatureCelsius;
            this.warningActive = warningActive;
            this.recommendation = recommendation;
        }

        public String getCondition() { return condition; }
        public double getRainProbability() { return rainProbability; }
        public double getTemperatureCelsius() { return temperatureCelsius; }
        public boolean isWarningActive() { return warningActive; }
        public String getRecommendation() { return recommendation; }
    }
}
