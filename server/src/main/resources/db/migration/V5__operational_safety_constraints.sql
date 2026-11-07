-- V5__operational_safety_constraints.sql
-- Operational safety hardening for attendee IDs, duplicate prevention, and workshop capacity workflows.

CREATE SEQUENCE IF NOT EXISTS attendee_registration_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
    'attendee_registration_seq',
    GREATEST(
        COALESCE(
            (
                SELECT MAX((substring(registration_id FROM 'VTX-2026-([0-9]+)'))::BIGINT)
                FROM attendees
                WHERE registration_id ~ '^VTX-2026-[0-9]+$'
            ),
            0
        ) + 1,
        1
    ),
    false
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_attendees_email_lower ON attendees (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_attendees_phone ON attendees (phone);

CREATE UNIQUE INDEX IF NOT EXISTS ux_workshop_confirmed_attendee
    ON workshop_registrations (workshop_id, attendee_id)
    WHERE status = 'CONFIRMED';
