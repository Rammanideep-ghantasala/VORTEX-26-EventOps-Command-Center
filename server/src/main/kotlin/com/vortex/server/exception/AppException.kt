package com.vortex.server.exception

import org.springframework.http.HttpStatus

/**
 * Base class for all operational (trusted) exceptions.
 * These map directly to HTTP responses with human-readable messages.
 */
open class AppException(
    val status: HttpStatus,
    override val message: String,
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

class ResourceNotFoundException(resource: String, identifier: String) :
    AppException(HttpStatus.NOT_FOUND, "$resource not found: $identifier")

class ConflictException(message: String) :
    AppException(HttpStatus.CONFLICT, message)

class BadRequestException(message: String) :
    AppException(HttpStatus.BAD_REQUEST, message)

class ForbiddenException(message: String = "Access denied") :
    AppException(HttpStatus.FORBIDDEN, message)

class UnauthorizedException(message: String = "Authentication required") :
    AppException(HttpStatus.UNAUTHORIZED, message)

