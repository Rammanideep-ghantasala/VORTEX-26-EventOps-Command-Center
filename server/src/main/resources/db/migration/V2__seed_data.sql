-- ============================================================
-- V2__seed_data.sql
-- VORTEX'26 - Demo seed data for development & presentations
-- ============================================================

-- Default staff accounts (passwords hashed with bcrypt 12 rounds)
-- Plain text passwords shown in comments for dev only
INSERT INTO users (name, email, password, role) VALUES
-- password: Admin@vortex26
('Super Admin',       'admin@vortex26.com',    '$2a$12$.AZ9XMs1b0IsLzDpXCe55.WTbnH6TPah5FyC5rO/S6HUAm8rKMCy2', 'SUPER_ADMIN'),
-- password: Gate@vortex26
('Gate Manager',      'gate@vortex26.com',     '$2a$12$.AZ9XMs1b0IsLzDpXCe55.WTbnH6TPah5FyC5rO/S6HUAm8rKMCy2', 'GATE_STAFF'),
-- password: Housing@vortex26
('Housing Officer',   'housing@vortex26.com',  '$2a$12$.AZ9XMs1b0IsLzDpXCe55.WTbnH6TPah5FyC5rO/S6HUAm8rKMCy2', 'HOUSING_STAFF'),
-- password: Reg@vortex26
('Registration Desk', 'reg@vortex26.com',      '$2a$12$.AZ9XMs1b0IsLzDpXCe55.WTbnH6TPah5FyC5rO/S6HUAm8rKMCy2', 'REGISTRATION_STAFF');

-- Housing blocks
INSERT INTO housing_blocks (block_name, block_type, total_rooms, total_capacity, occupied_beds) VALUES
('Hostel Garnet A (Boys)',    'BOYS',  30, 120, 45),
('Block B - Boys Hostel',     'BOYS',  25, 100, 30),
('Hostel Opal C (Girls)',     'GIRLS', 30, 120, 55),
('Block D - Girls Hostel',    'GIRLS', 20, 80,  20),
('VIP Guest House',           'VIP',   10, 20,  4);

-- Sample rooms for Hostel Garnet A (Boys)
INSERT INTO rooms (block_id, room_number, capacity, occupied) VALUES
(1, 'GA-101', 4, 3), (1, 'GA-102', 4, 2), (1, 'GA-103', 4, 4),
(1, 'GA-104', 4, 0), (1, 'GA-105', 4, 4), (1, 'GA-106', 4, 2),
(1, 'GA-107', 4, 1), (1, 'GA-108', 4, 3), (1, 'GA-109', 4, 4),
(1, 'GA-110', 4, 0);

-- Sample rooms for Hostel Opal C (Girls)
INSERT INTO rooms (block_id, room_number, capacity, occupied) VALUES
(3, 'OC-101', 4, 4), (3, 'OC-102', 4, 3), (3, 'OC-103', 4, 2),
(3, 'OC-104', 4, 4), (3, 'OC-105', 4, 0), (3, 'OC-106', 4, 4),
(3, 'OC-107', 4, 2), (3, 'OC-108', 4, 3), (3, 'OC-109', 4, 1),
(3, 'OC-110', 4, 0);

-- Sample attendees
INSERT INTO attendees (registration_id, qr_code, full_name, email, phone, college, registration_type, workshops, competitions, checked_in, housing_required) VALUES
('VTX-2026-0001','QR-VTX-0001-A7K9','Arjun Sharma','arjun.sharma@srm.edu.in','9876543210','SRM Institute of Science and Technology','PRE_REGISTERED',ARRAY['AI & ML Workshop','Cloud Computing Bootcamp'],ARRAY['Hackathon 48hr','Coding Contest'],FALSE,TRUE),
('VTX-2026-0002','QR-VTX-0002-B3M5','Priya Krishnan','priya.k@vit.ac.in','9765432109','VIT Vellore','PRE_REGISTERED',ARRAY['Web Dev Masterclass'],ARRAY['UI/UX Design Challenge'],TRUE,TRUE),
('VTX-2026-0003','QR-VTX-0003-C6N2','Rahul Mehta','rahul.mehta@iit.ac.in','9654321098','IIT Madras','PRE_REGISTERED',ARRAY['Cybersecurity Essentials','AI & ML Workshop'],ARRAY['CTF Challenge'],FALSE,FALSE),
('VTX-2026-0004','QR-VTX-0004-D1P8','Sneha Patel','sneha.patel@bits.ac.in','9543210987','BITS Pilani','PRE_REGISTERED',ARRAY['Cloud Computing Bootcamp'],ARRAY['Startup Pitch'],TRUE,TRUE),
('VTX-2026-0005','QR-VTX-0005-E4Q3','Karthik Rajan','karthik.r@nit.ac.in','9432109876','NIT Trichy','PRE_REGISTERED',ARRAY['Robotics & IoT Lab'],ARRAY['Robo Wars','Coding Contest'],FALSE,TRUE),
('VTX-2026-0006','QR-VTX-0006-F7R1','Aishwarya Nair','aish.nair@kerala.edu','9321098765','Kerala University','PRE_REGISTERED',ARRAY['Web Dev Masterclass','UI/UX Design'],ARRAY['UI/UX Design Challenge'],TRUE,FALSE),
('VTX-2026-0007','QR-VTX-0007-G2S6','Vikram Singh','vikram.s@du.ac.in','9210987654','Delhi University','PRE_REGISTERED',ARRAY['AI & ML Workshop'],ARRAY['Hackathon 48hr'],FALSE,TRUE),
('VTX-2026-0008','QR-VTX-0008-H5T9','Deepika Rao','deepika.rao@manipal.edu','9109876543','Manipal Institute','PRE_REGISTERED',ARRAY['Cybersecurity Essentials'],ARRAY['CTF Challenge','Bug Bounty'],TRUE,TRUE),
('VTX-2026-0009','QR-VTX-0009-I8U4','Mohammed Farhan','m.farhan@hyderabad.edu','9008765432','Osmania University','PRE_REGISTERED',ARRAY['Cloud Computing Bootcamp','Robotics & IoT Lab'],ARRAY['Robo Wars'],FALSE,FALSE),
('VTX-2026-0010','QR-VTX-0010-J3V7','Lakshmi Suresh','lakshmi.s@anna.edu.in','8997654321','Anna University','PRE_REGISTERED',ARRAY['AI & ML Workshop','Web Dev Masterclass'],ARRAY['Coding Contest','Startup Pitch'],TRUE,TRUE),
('VTX-2026-0011','QR-VTX-0011-K6W2','Rohan Gupta','rohan.g@pune.edu','8876543210','University of Pune','WALK_IN',ARRAY['Web Dev Masterclass'],ARRAY['Coding Contest'],TRUE,FALSE),
('VTX-2026-0012','QR-VTX-0012-L9X5','Ananya Mishra','ananya.m@bhu.ac.in','8765432109','BHU Varanasi','WALK_IN',ARRAY['Cybersecurity Essentials'],ARRAY['CTF Challenge'],FALSE,TRUE),
('VTX-2026-0013','QR-VTX-0013-M2Y8','Siddharth Kumar','sid.kumar@lpu.in','8654321098','Lovely Professional University','PRE_REGISTERED',ARRAY['AI & ML Workshop'],ARRAY['Hackathon 48hr','Robo Wars'],FALSE,TRUE),
('VTX-2026-0014','QR-VTX-0014-N5Z1','Divya Chandran','divya.c@cu.ac.in','8543210987','Chandigarh University','PRE_REGISTERED',ARRAY['UI/UX Design','Cloud Computing Bootcamp'],ARRAY['UI/UX Design Challenge'],TRUE,TRUE),
('VTX-2026-0015','QR-VTX-0015-O8A4','Ajay Tiwari','ajay.t@amity.edu','8432109876','Amity University','WALK_IN',ARRAY['Robotics & IoT Lab'],ARRAY['Robo Wars'],TRUE,FALSE);

