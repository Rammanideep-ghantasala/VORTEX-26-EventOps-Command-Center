-- ============================================================
-- V1__init_schema.sql
-- VORTEX'26 Event Management System - Initial Schema
-- ============================================================

-- Users (Admin Staff)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(30)  NOT NULL DEFAULT 'GATE_STAFF',
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Attendees (Pre-registered & Walk-ins)
CREATE TABLE attendees (
    id                  BIGSERIAL   PRIMARY KEY,
    registration_id     VARCHAR(20)  NOT NULL UNIQUE,
    qr_code             VARCHAR(255) NOT NULL UNIQUE,
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    phone               VARCHAR(20)  NOT NULL,
    college             VARCHAR(150) NOT NULL,
    registration_type   VARCHAR(20)  NOT NULL DEFAULT 'PRE_REGISTERED',
    payment_mode        VARCHAR(20),
    payment_reference   VARCHAR(100),
    amount_paid         DECIMAL(10,2),
    workshops           TEXT[],
    competitions        TEXT[],
    checked_in          BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_in_at       TIMESTAMPTZ,
    checked_in_gate     VARCHAR(50),
    checked_in_by       BIGINT REFERENCES users(id),
    housing_required    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Housing Blocks (Boys / Girls / VIP)
CREATE TABLE housing_blocks (
    id              BIGSERIAL   PRIMARY KEY,
    block_name      VARCHAR(100) NOT NULL,
    block_type      VARCHAR(20)  NOT NULL,
    total_rooms     INT          NOT NULL DEFAULT 0,
    total_capacity  INT          NOT NULL DEFAULT 0,
    occupied_beds   INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Rooms within a block
CREATE TABLE rooms (
    id              BIGSERIAL   PRIMARY KEY,
    block_id        BIGINT       NOT NULL REFERENCES housing_blocks(id),
    room_number     VARCHAR(20)  NOT NULL,
    capacity        INT          NOT NULL DEFAULT 4,
    occupied        INT          NOT NULL DEFAULT 0,
    UNIQUE(block_id, room_number)
);

-- Housing Allocations
CREATE TABLE housing_allocations (
    id              BIGSERIAL   PRIMARY KEY,
    attendee_id     BIGINT       NOT NULL UNIQUE REFERENCES attendees(id),
    room_id         BIGINT       NOT NULL REFERENCES rooms(id),
    block_id        BIGINT       NOT NULL REFERENCES housing_blocks(id),
    checked_in      BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_in_at   TIMESTAMPTZ,
    checked_out     BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_out_at  TIMESTAMPTZ,
    allocated_by    BIGINT REFERENCES users(id),
    allocated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Gate Admission Audit Log (immutable)
CREATE TABLE gate_logs (
    id              BIGSERIAL   PRIMARY KEY,
    attendee_id     BIGINT       NOT NULL REFERENCES attendees(id),
    action          VARCHAR(30)  NOT NULL,
    gate_location   VARCHAR(50),
    operator_id     BIGINT       NOT NULL REFERENCES users(id),
    note            TEXT,
    logged_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for high-throughput gate check-in lookups
CREATE INDEX idx_attendees_registration_id  ON attendees(registration_id);
CREATE INDEX idx_attendees_qr_code          ON attendees(qr_code);
CREATE INDEX idx_attendees_email            ON attendees(email);
CREATE INDEX idx_attendees_phone            ON attendees(phone);
CREATE INDEX idx_attendees_checked_in       ON attendees(checked_in);
CREATE INDEX idx_attendees_reg_type         ON attendees(registration_type);
CREATE INDEX idx_gate_logs_attendee         ON gate_logs(attendee_id);
CREATE INDEX idx_housing_alloc_attendee     ON housing_allocations(attendee_id);
CREATE INDEX idx_housing_alloc_room         ON housing_allocations(room_id);

