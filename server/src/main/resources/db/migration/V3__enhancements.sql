-- ============================================================
-- V3__enhancements.sql
-- VORTEX'26: Accommodation Dates & Gender, Attendee Profile, Workshop Capacity Engine
-- ============================================================

-- 1. Attendee Profile Enhancements (Gender, Department, Year of Study)
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'MALE';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Computer Science & Engineering';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(20) DEFAULT '3rd Year';

CREATE INDEX IF NOT EXISTS idx_attendees_gender ON attendees(gender);

-- Update sample attendees with gender data
UPDATE attendees SET gender = 'MALE', department = 'CSE', year_of_study = '3rd Year' WHERE full_name IN ('Arjun Sharma', 'Rahul Mehta', 'Karthik Rajan', 'Vikram Singh', 'Mohammed Farhan', 'Rohan Gupta', 'Siddharth Kumar', 'Ajay Tiwari');
UPDATE attendees SET gender = 'FEMALE', department = 'ECE', year_of_study = '4th Year' WHERE full_name IN ('Priya Krishnan', 'Sneha Patel', 'Aishwarya Nair', 'Deepika Rao', 'Lakshmi Suresh', 'Ananya Mishra', 'Divya Chandran');

-- 2. Housing / Accommodation Allocations Date Management & Status
ALTER TABLE housing_allocations ADD COLUMN IF NOT EXISTS from_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE housing_allocations ADD COLUMN IF NOT EXISTS to_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '2 day');
ALTER TABLE housing_allocations ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ALLOCATED';

-- Drop the old unique constraint on attendee_id so historical accommodation records are preserved
ALTER TABLE housing_allocations DROP CONSTRAINT IF EXISTS housing_allocations_attendee_id_key;

CREATE INDEX IF NOT EXISTS idx_housing_alloc_dates ON housing_allocations(room_id, from_date, to_date, status);

-- 3. Workshop Seat Capacity Management Engine
CREATE TABLE IF NOT EXISTS workshops (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT,
    capacity    INT          NOT NULL DEFAULT 100 CHECK (capacity >= 1 AND capacity <= 100),
    instructor  VARCHAR(100) DEFAULT 'Industry Expert',
    venue       VARCHAR(100) DEFAULT 'Auditorium Hall',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed initial workshops with independent capacities
INSERT INTO workshops (name, code, description, capacity, instructor, venue) VALUES
('AI & ML Workshop',           'WS-AIML',  'Deep Learning & Model Deployment with PyTorch', 100, 'Dr. Rajiv Menon',   'Hall A - CS Block'),
('Web Dev Masterclass',        'WS-WEB',   'Modern Full-Stack Engineering with React & Node', 50,  'Ananya Roy',        'Lab 3 - IT Dept'),
('Cybersecurity Essentials',   'WS-SEC',   'Ethical Hacking, Penetration Testing & Defense', 30,  'Karan Malhotra',    'Lab 5 - Cyber Lab'),
('Cloud Computing Bootcamp',   'WS-CLOUD', 'AWS & Cloud-Native Microservices Architecture', 40,  'Sneha Deshmukh',    'Seminar Hall 2'),
('Robotics & IoT Lab',         'WS-ROBO',  'Embedded Systems, Arduino & ROS Programming',    25,  'Prof. R. Sundaram', 'Robotics Center'),
('UI/UX Design',               'WS-UIUX',  'Design Systems, Prototyping & Figma Masterclass', 35,  'Tara Varma',        'Design Studio B')
ON CONFLICT (name) DO NOTHING;

-- 4. Workshop Registrations Table (Track confirmed/cancelled, prevent duplicate/overbooking)
CREATE TABLE IF NOT EXISTS workshop_registrations (
    id            BIGSERIAL PRIMARY KEY,
    workshop_id   BIGINT NOT NULL REFERENCES workshops(id),
    attendee_id   BIGINT NOT NULL REFERENCES attendees(id),
    status        VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ws_reg_workshop ON workshop_registrations(workshop_id, status);
CREATE INDEX IF NOT EXISTS idx_ws_reg_attendee ON workshop_registrations(attendee_id, status);

-- 5. Event Registrations Table (Competitions / Symposium events)
CREATE TABLE IF NOT EXISTS event_registrations (
    id            BIGSERIAL PRIMARY KEY,
    event_name    VARCHAR(150) NOT NULL,
    attendee_id   BIGINT NOT NULL REFERENCES attendees(id),
    status        VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_reg_attendee ON event_registrations(attendee_id);

-- Populate initial workshop_registrations from attendee workshop arrays
INSERT INTO workshop_registrations (workshop_id, attendee_id, status, registered_at)
SELECT w.id, a.id, 'CONFIRMED', a.created_at
FROM attendees a, workshops w
WHERE w.name = ANY(a.workshops)
ON CONFLICT DO NOTHING;

-- Populate initial event_registrations from attendee competition arrays
INSERT INTO event_registrations (event_name, attendee_id, status, registered_at)
SELECT c, a.id, 'CONFIRMED', a.created_at
FROM attendees a, unnest(a.competitions) AS c
ON CONFLICT DO NOTHING;

