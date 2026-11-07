package com.vortex.server.exception

import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

/**
 * Global centralized error handler.
 * Catches all exceptions thrown from any controller and maps them
 * to structured JSON error responses — no try/catch boilerplate in controllers.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    data class ErrorResponse(
        val status: Int,
        val error: String,
        val message: String,
        val timestamp: Instant = Instant.now(),
        val fieldErrors: Map<String, String>? = null
    )

    // ── Operational Errors (AppException subclasses) ──────────────────────────

    @ExceptionHandler(AppException::class)
    fun handleAppException(ex: AppException): ResponseEntity<ErrorResponse> {
        log.warn("Operational error [${ex.status}]: ${ex.message}")
        return ResponseEntity.status(ex.status).body(
            ErrorResponse(
                status = ex.status.value(),
                error = ex.status.reasonPhrase,
                message = ex.message
            )
        )
    }

    // ── Validation Errors (@Valid / @Validated) ───────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val fieldErrors = ex.bindingResult.allErrors.associate { error ->
            val fieldName = (error as? FieldError)?.field ?: error.objectName
            fieldName to (error.defaultMessage ?: "Invalid value")
        }
        log.warn("Validation failed: $fieldErrors")
        return ResponseEntity.badRequest().body(
            ErrorResponse(
                status = HttpStatus.BAD_REQUEST.value(),
                error = "Validation Failed",
                message = "One or more fields have invalid values",
                fieldErrors = fieldErrors
            )
        )
    }

    // ── Spring Security Errors ────────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            ErrorResponse(
                status = HttpStatus.UNAUTHORIZED.value(),
                error = "Unauthorized",
                message = "Invalid email or password"
            )
        )
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ErrorResponse(
                status = HttpStatus.FORBIDDEN.value(),
                error = "Forbidden",
                message = "You do not have permission to perform this action"
            )
        )
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(ex: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        log.warn("Database constraint violation: ${ex.message}")
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ErrorResponse(
                status = HttpStatus.CONFLICT.value(),
                error = "Conflict",
                message = "The request conflicts with an existing record or capacity constraint"
            )
        )
    }

    // ── Catch-all (System Errors) ─────────────────────────────────────────────

    @ExceptionHandler(Exception::class)
    fun handleAllUnhandled(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error("Unhandled system exception: ${ex.javaClass.simpleName}", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ErrorResponse(
                status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                error = "Internal Server Error",
                message = "An unexpected error occurred. Please try again."
            )
        )
    }
}

