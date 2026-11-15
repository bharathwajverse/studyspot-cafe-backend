-- StudySpot Cafe - Seed Data
-- Group 4: Backend Development Fundamentals

-- Enable Foreign Key constraints
PRAGMA foreign_keys = ON;

-- Insert Sample Students (At least 5)
INSERT OR IGNORE INTO students (id, name, email) VALUES
    (1, 'Alice Johnson', 'alice.johnson@example.com'),
    (2, 'Bob Smith', 'bob.smith@example.com'),
    (3, 'Clara Zhang', 'clara.zhang@example.com'),
    (4, 'David Patel', 'david.patel@example.com'),
    (5, 'Emma Wilson', 'emma.wilson@example.com');

-- Insert Sample Carrels (At least 10 across zones A, B, C)
INSERT OR IGNORE INTO carrels (id, name, zone) VALUES
    (1, 'Carrel A-1', 'A'),
    (2, 'Carrel A-2', 'A'),
    (3, 'Carrel A-3', 'A'),
    (4, 'Carrel A-4', 'A'),
    (5, 'Carrel B-1', 'B'),
    (6, 'Carrel B-2', 'B'),
    (7, 'Carrel B-3', 'B'),
    (8, 'Carrel C-1', 'C'),
    (9, 'Carrel C-2', 'C'),
    (10, 'Carrel C-3', 'C');

-- Insert Sample Bookings (At least 5 valid bookings)
INSERT OR IGNORE INTO bookings (id, student_id, carrel_id, booking_date) VALUES
    (1, 1, 1, '2026-11-20'),
    (2, 2, 2, '2026-11-21'),
    (3, 3, 5, '2026-11-22'),
    (4, 4, 8, '2026-11-23'),
    (5, 5, 10, '2026-11-24');
