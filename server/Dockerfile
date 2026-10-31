# Stage 1: Build with Gradle and OpenJDK 21
FROM gradle:8.10-jdk21-alpine AS builder
WORKDIR /app

# Copy gradle config first for layer caching
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

# Build production jar without tests (or with tests if db mocked)
RUN gradle bootJar --no-daemon -x test

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S vortex && adduser -S vortex -G vortex
USER vortex

COPY --from=builder /app/build/libs/vortex-server-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

