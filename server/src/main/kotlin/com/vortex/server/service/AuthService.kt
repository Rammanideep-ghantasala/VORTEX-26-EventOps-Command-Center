package com.vortex.server.service

import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.UnauthorizedException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.User
import com.vortex.server.repository.UserRepository
import com.vortex.server.security.JwtTokenProvider
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun login(request: LoginRequest): AuthResponse {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )
        val token = jwtTokenProvider.generateToken(authentication)
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { UnauthorizedException("User not found") }
        return AuthResponse(token = token, user = UserProfileDto.from(user))
    }

    fun register(request: RegisterUserRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw ConflictException("An account with email '${request.email}' already exists")
        }
        val user = User(
            name = request.name,
            email = request.email,
            password = passwordEncoder.encode(request.password),
            role = request.role
        )
        userRepository.save(user)
        val token = jwtTokenProvider.generateTokenFromEmail(user.email)
        return AuthResponse(token = token, user = UserProfileDto.from(user))
    }

    fun getProfile(email: String): UserProfileDto {
        val user = userRepository.findByEmail(email)
            .orElseThrow { UnauthorizedException("Session expired") }
        return UserProfileDto.from(user)
    }
}

