package com.vortex.server.security

import io.jsonwebtoken.*
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${app.jwt.secret}") private val jwtSecret: String,
    @Value("\${app.jwt.expiration-ms}") private val jwtExpirationMs: Long
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val signingKey: SecretKey by lazy {
        require(jwtSecret.toByteArray().size >= 32) {
            "APP_JWT_SECRET must be at least 32 bytes for HS256"
        }
        // Use raw bytes for the secret (must be at least 256 bits for HS256)
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    fun generateToken(authentication: Authentication): String {
        val userDetails = authentication.principal as UserDetails
        return generateTokenFromEmail(userDetails.username)
    }

    fun generateTokenFromEmail(email: String): String {
        val now = Date()
        val expiry = Date(now.time + jwtExpirationMs)
        return Jwts.builder()
            .subject(email)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey)
            .compact()
    }

    fun getEmailFromToken(token: String): String {
        return parseClaims(token).subject
    }

    fun validateToken(token: String): Boolean {
        return try {
            parseClaims(token)
            true
        } catch (ex: ExpiredJwtException) {
            log.warn("JWT token is expired: {}", ex.message)
            false
        } catch (ex: JwtException) {
            log.warn("Invalid JWT token: {}", ex.message)
            false
        }
    }

    private fun parseClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
}

