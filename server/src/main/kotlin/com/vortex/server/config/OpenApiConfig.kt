package com.vortex.server.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("VORTEX'26 Event Operations API")
                .version("1.0.0")
                .description("""
                    **VORTEX'26 Event Management System** — Enterprise-grade REST API
                    
                    Secured with JWT Bearer Authentication. 
                    Use the `/api/auth/login` endpoint to obtain a token, then click **Authorize** above.
                    
                    **Roles:**
                    - `SUPER_ADMIN` — Full access
                    - `GATE_STAFF` — Gate admissions & check-in
                    - `REGISTRATION_STAFF` — Walk-in registrations  
                    - `HOUSING_STAFF` — Room allocations & housing management
                """.trimIndent())
                .contact(Contact().name("VORTEX'26 Tech Team"))
        )
        .addSecurityItem(SecurityRequirement().addList("Bearer Authentication"))
        .components(
            Components().addSecuritySchemes(
                "Bearer Authentication",
                SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter the JWT token obtained from /api/auth/login")
            )
        )
}

