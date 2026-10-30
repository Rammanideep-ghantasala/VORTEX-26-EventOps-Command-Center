package com.vortex.server.controller

import com.vortex.server.model.dto.*
import com.vortex.server.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login, register, and profile management")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    @Operation(summary = "Login with email and password, returns JWT token")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.login(request))
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new staff account (SUPER_ADMIN only in production)")
    fun register(@Valid @RequestBody request: RegisterUserRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request))
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    fun getProfile(authentication: Authentication): ResponseEntity<UserProfileDto> {
        return ResponseEntity.ok(authService.getProfile(authentication.name))
    }
}

