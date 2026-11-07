package com.vortex.server

import com.fasterxml.jackson.databind.ObjectMapper
import com.vortex.server.model.entity.*
import com.vortex.server.repository.*
import org.hamcrest.Matchers.`is`
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VortexApplicationTests {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var jdbcTemplate: JdbcTemplate

    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var attendeeRepository: AttendeeRepository
    @Autowired lateinit var gateLogRepository: GateLogRepository
    @Autowired lateinit var housingBlockRepository: HousingBlockRepository
    @Autowired lateinit var roomRepository: RoomRepository
    @Autowired lateinit var housingAllocationRepository: HousingAllocationRepository
    @Autowired lateinit var workshopRepository: WorkshopRepository
    @Autowired lateinit var workshopRegistrationRepository: WorkshopRegistrationRepository
    @Autowired lateinit var eventRegistrationRepository: EventRegistrationRepository

    @BeforeEach
    fun resetData() {
        gateLogRepository.deleteAll()
        workshopRegistrationRepository.deleteAll()
        eventRegistrationRepository.deleteAll()
        housingAllocationRepository.deleteAll()
        attendeeRepository.deleteAll()
        roomRepository.deleteAll()
        housingBlockRepository.deleteAll()
        workshopRepository.deleteAll()
        userRepository.deleteAll()
        jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS attendee_registration_seq START WITH 1")
        jdbcTemplate.execute("ALTER SEQUENCE attendee_registration_seq RESTART WITH 1")
        seedUsers()
    }

    @Test
    fun `login succeeds and fails predictably`() {
        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("email" to "admin@vortex26.com", "password" to "Admin@vortex26")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.user.role", `is`("SUPER_ADMIN")))

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("email" to "admin@vortex26.com", "password" to "wrong-password")))
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `staff creation requires super admin`() {
        mockMvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(staffPayload("open@vortex26.com", "SUPER_ADMIN")))
        )
            .andExpect(status().isForbidden)

        val gateToken = tokenFor("gate@vortex26.com")
        mockMvc.perform(
            post("/api/auth/register")
                .header("Authorization", "Bearer $gateToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(staffPayload("new-admin@vortex26.com", "SUPER_ADMIN")))
        )
            .andExpect(status().isForbidden)

        val adminToken = tokenFor("admin@vortex26.com")
        mockMvc.perform(
            post("/api/auth/register")
                .header("Authorization", "Bearer $adminToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(staffPayload("new-gate@vortex26.com", "GATE_STAFF")))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.email", `is`("new-gate@vortex26.com")))
            .andExpect(jsonPath("$.role", `is`("GATE_STAFF")))
    }

    @Test
    fun `gate staff can search attendees`() {
        val attendee = attendee("VTX-2026-0001", "QR-1", "search@example.com", "9876543210")
        attendeeRepository.save(attendee)

        mockMvc.perform(
            get("/api/attendees/search")
                .header("Authorization", "Bearer ${tokenFor("gate@vortex26.com")}")
                .param("q", "search@example.com")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.registrationId", `is`("VTX-2026-0001")))
    }

    @Test
    fun `walk-in registration rejects duplicate email and phone`() {
        val token = tokenFor("reg@vortex26.com")
        mockMvc.perform(
            post("/api/attendees/walk-in")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(walkInPayload("walkin@example.com", "9876543210")))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.registrationId", `is`("VTX-2026-0001")))

        mockMvc.perform(
            post("/api/attendees/walk-in")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(walkInPayload("walkin@example.com", "9876543211")))
        )
            .andExpect(status().isConflict)

        mockMvc.perform(
            post("/api/attendees/walk-in")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(walkInPayload("other@example.com", "9876543210")))
        )
            .andExpect(status().isConflict)
    }

    @Test
    fun `gate check-in prevents duplicates`() {
        attendeeRepository.save(attendee("VTX-2026-0002", "QR-2", "gate-user@example.com", "9876543212"))
        val token = tokenFor("gate@vortex26.com")
        val payload = mapOf("query" to "VTX-2026-0002", "gateLocation" to "Main Gate")

        mockMvc.perform(
            post("/api/attendees/check-in")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(payload))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success", `is`(true)))

        mockMvc.perform(
            post("/api/attendees/check-in")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(payload))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success", `is`(false)))
            .andExpect(jsonPath("$.alreadyCheckedIn", `is`(true)))
    }

    @Test
    fun `housing allocation validates gender dates and capacity`() {
        val male1 = attendeeRepository.save(attendee("VTX-2026-0003", "QR-3", "male1@example.com", "9876543213", Gender.MALE, true))
        val male2 = attendeeRepository.save(attendee("VTX-2026-0004", "QR-4", "male2@example.com", "9876543214", Gender.MALE, true))
        val boys = housingBlockRepository.save(HousingBlock(blockName = "Garnet A", blockType = BlockType.BOYS, totalRooms = 1, totalCapacity = 1))
        val girls = housingBlockRepository.save(HousingBlock(blockName = "Opal C", blockType = BlockType.GIRLS, totalRooms = 1, totalCapacity = 1))
        val boysRoom = roomRepository.save(Room(block = boys, roomNumber = "GA-101", capacity = 1))
        val girlsRoom = roomRepository.save(Room(block = girls, roomNumber = "OC-101", capacity = 1))
        val token = tokenFor("housing@vortex26.com")

        mockMvc.perform(
            post("/api/housing/allocate")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(allocationPayload(male1.id, girlsRoom.id)))
        )
            .andExpect(status().isBadRequest)

        mockMvc.perform(
            post("/api/housing/allocate")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(allocationPayload(male1.id, boysRoom.id, "2026-11-05", "2026-11-04")))
        )
            .andExpect(status().isBadRequest)

        mockMvc.perform(
            post("/api/housing/allocate")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(allocationPayload(male1.id, boysRoom.id)))
        )
            .andExpect(status().isCreated)

        mockMvc.perform(
            post("/api/housing/allocate")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(allocationPayload(male2.id, boysRoom.id)))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `workshop capacity prevents duplicate and over-capacity registrations`() {
        val attendee1 = attendeeRepository.save(attendee("VTX-2026-0005", "QR-5", "ws1@example.com", "9876543215"))
        val attendee2 = attendeeRepository.save(attendee("VTX-2026-0006", "QR-6", "ws2@example.com", "9876543216"))
        val workshop = workshopRepository.save(
            Workshop(
                name = "Cybersecurity Essentials",
                code = "WS-SEC",
                capacity = 1
            )
        )
        val token = tokenFor("reg@vortex26.com")

        mockMvc.perform(
            post("/api/workshops/${workshop.id}/register")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("attendeeId" to attendee1.id)))
        )
            .andExpect(status().isCreated)

        mockMvc.perform(
            post("/api/workshops/${workshop.id}/register")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("attendeeId" to attendee1.id)))
        )
            .andExpect(status().isConflict)

        mockMvc.perform(
            post("/api/workshops/${workshop.id}/register")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("attendeeId" to attendee2.id)))
        )
            .andExpect(status().isBadRequest)
    }

    private fun seedUsers() {
        userRepository.saveAll(
            listOf(
                staff("Super Admin", "admin@vortex26.com", UserRole.SUPER_ADMIN),
                staff("Gate Staff", "gate@vortex26.com", UserRole.GATE_STAFF),
                staff("Housing Staff", "housing@vortex26.com", UserRole.HOUSING_STAFF),
                staff("Registration Staff", "reg@vortex26.com", UserRole.REGISTRATION_STAFF),
            )
        )
    }

    private fun staff(name: String, email: String, role: UserRole) = User(
        name = name,
        email = email,
        password = passwordEncoder.encode("Admin@vortex26"),
        role = role
    )

    private fun attendee(
        registrationId: String,
        qrCode: String,
        email: String,
        phone: String,
        gender: Gender = Gender.MALE,
        housingRequired: Boolean = false
    ) = Attendee(
        registrationId = registrationId,
        qrCode = qrCode,
        fullName = email.substringBefore("@").replaceFirstChar { it.uppercase() },
        email = email,
        phone = phone,
        college = "Test University",
        gender = gender,
        registrationType = RegistrationType.PRE_REGISTERED,
        amountPaid = BigDecimal.ZERO,
        housingRequired = housingRequired
    )

    private fun tokenFor(email: String): String {
        val result = mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(mapOf("email" to email, "password" to "Admin@vortex26")))
        )
            .andExpect(status().isOk)
            .andReturn()

        val tree = objectMapper.readTree(result.response.contentAsString)
        return tree["token"].asText()
    }

    private fun staffPayload(email: String, role: String) = mapOf(
        "name" to "New Staff",
        "email" to email,
        "password" to "Admin@vortex26",
        "role" to role
    )

    private fun walkInPayload(email: String, phone: String) = mapOf(
        "fullName" to "Walk In User",
        "email" to email,
        "phone" to phone,
        "college" to "Walk In College",
        "gender" to "MALE",
        "department" to "CSE",
        "yearOfStudy" to "3rd Year",
        "workshops" to emptyList<String>(),
        "competitions" to emptyList<String>(),
        "housingRequired" to false,
        "paymentMode" to "CASH",
        "amountPaid" to 500
    )

    private fun allocationPayload(
        attendeeId: Long,
        roomId: Long,
        fromDate: String = "2026-11-04",
        toDate: String = "2026-11-06"
    ) = mapOf(
        "attendeeId" to attendeeId,
        "roomId" to roomId,
        "fromDate" to fromDate,
        "toDate" to toDate,
        "manualGenderOverride" to false
    )

    private fun json(value: Any): String = objectMapper.writeValueAsString(value)
}
