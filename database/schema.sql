-- StudySpot Cafe - Database Schema
-- Group 4: Backend Development Fundamentals

-- Enable Foreign Key constraints
PRAGMA foreign_keys = ON;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
);

-- 2. Carrels Table
CREATE TABLE IF NOT EXISTS carrels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    zone TEXT NOT NULL
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    carrel_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (carrel_id) REFERENCES carrels(id) ON DELETE RESTRICT
);
