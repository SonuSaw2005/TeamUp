# Multi-stage Dockerfile for Spring Boot Application

# 1. Build Stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081

# Configure environment defaults for Render
ENV PORT=8081
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT}"]
