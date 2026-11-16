# Automated Test Suite Report
## StudySpot Cafe – Study Carrel Booking Management System
**Course:** Backend Development Fundamentals | **Group:** Group 4  
**Date of Execution:** November 15, 2026  
**Test Framework:** Node.js Native Test Runner (`node:test`, `node:assert`) + Supertest v7.0.0  

---

## 1. Test Execution Summary

```text
▶ StudySpot Cafe - Group 4 API Automated Test Suite
  ▶ General Routing & Health Check (3 tests passed)
  ▶ Students API (10 tests passed)
  ▶ Carrel CRUD & Input Validation (19 tests passed)
  ▶ Zone-Based Search (5 tests passed)
  ▶ Ascending and Descending Sorting (5 tests passed)
  ▶ Bookings JOIN API (23 tests passed)
  ▶ Database Initialization & Restart Idempotency (3 tests passed)
✔ StudySpot Cafe - Group 4 API Automated Test Suite
ℹ tests 68
ℹ suites 8
ℹ pass 68
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

- **Total Test Suites:** 8 (1 root suite + 7 functional sub-suites)
- **Total Tests Executed:** 68
- **Total Passed:** 68 (100%)
- **Total Failed:** 0
- **Total Skipped:** 0
- **Execution Time:** ~1.1 to 2.3 seconds

---

## 2. Test Execution Environment

| Parameter | Value |
|---|---|
| **Operating System** | Windows (x64) |
| **Node.js Runtime** | Node.js v26.13.0 (Minimum supported: v18.0.0) |
| **Package Manager** | npm v11.20.0 |
| **Test Command** | `npm.cmd test` (or `node --test tests/api.test.js`) |
| **Test Database** | `tests/test_studyspot.db` (Clean isolated temporary file) |
| **Development Database** | `database/data/studyspot.db` (Completely untouched by tests) |

---

## 3. Test Coverage by Functional Area

### Suite 1: General Routing & Health Check (3 Tests)
1. `GET /` should return HTTP 200 and operational status payload with group and course details.
2. `GET /unknown-route` should return HTTP 404 with standard JSON format (`Resource not found`).
3. `POST /students` with malformed JSON body should return HTTP 400 with clean error format (`Malformed JSON in request body`).

### Suite 2: Students API (10 Tests)
1. `GET /students` should retrieve all registered students (returns array with at least 5 baseline records).
2. `GET /students/:id` should retrieve a single student by numeric ID.
3. `GET /students/:id` should return HTTP 404 for a nonexistent student ID (`9999`).
4. `GET /students/:id` should reject malformed alphanumeric ID (`"12abc"`) with HTTP 400.
5. `GET /students/:id` should reject decimal ID (`"1.5"`) with HTTP 400.
6. `GET /students/:id` should reject negative ID (`"-1"`) with HTTP 400.
7. `GET /students/:id` should reject zero ID (`"0"`) with HTTP 400.
8. `POST /students` should create a new student with valid name and email (returns HTTP 201).
9. `POST /students` should reject a student registration with missing name with HTTP 400.
10. `POST /students` should reject an invalid email format with HTTP 400.

### Suite 3: Carrel CRUD & Input Validation (19 Tests)
1. `GET /carrels` should retrieve all study carrels (returns array with at least 10 baseline records).
2. `GET /carrels/:id` should retrieve an individual carrel by numeric ID.
3. `GET /carrels/:id` should return HTTP 404 for a nonexistent carrel ID (`9999`).
4. `GET /carrels/:id` should reject malformed ID (`"12abc"`) with HTTP 400.
5. `GET /carrels/:id` should reject decimal ID (`"1.5"`) with HTTP 400.
6. `GET /carrels/:id` should reject negative ID (`"-1"`) with HTTP 400.
7. `GET /carrels/:id` should reject zero ID (`"0"`) with HTTP 400.
8. `POST /carrels` should create a new carrel with valid data (returns HTTP 201).
9. `PUT /carrels/:id` should update an existing carrel (returns HTTP 200 with updated fields).
10. `PUT /carrels/:id` should return HTTP 404 for nonexistent carrel ID.
11. `PUT /carrels/:id` should reject malformed ID (`"12abc"`) with HTTP 400.
12. `DELETE /carrels/:id` should delete an existing carrel that has no associated bookings (returns HTTP 200).
13. `DELETE /carrels/:id` should return HTTP 404 for nonexistent carrel ID.
14. `DELETE /carrels/:id` should reject malformed ID (`"12abc"`) with HTTP 400.
15. `DELETE /carrels/:id` should return HTTP 409 Conflict when attempting to delete a carrel referenced by existing bookings.
16. `POST /carrels` should reject missing name with HTTP 400.
17. `POST /carrels` should reject missing zone with HTTP 400.
18. `POST /carrels` should reject empty string name with HTTP 400.
19. `POST /carrels` should reject whitespace-only values with HTTP 400.

### Suite 4: Zone-Based Search (5 Tests)
1. `GET /carrels?zone=A` should return only Zone A carrels.
2. `GET /carrels?zone=B` should return only Zone B carrels.
3. `GET /carrels?zone=NonExistent` should return empty array `[]` with HTTP 200.
4. `GET /carrels` without zone parameter should return all carrels.
5. `GET /carrels?zone=` with empty zone parameter should safely return all carrels without error.

### Suite 5: Ascending and Descending Sorting (5 Tests)
1. `GET /carrels?sort=name&order=asc` should return carrels in A to Z alphabetical order.
2. `GET /carrels?sort=name&order=desc` should return carrels in Z to A reverse alphabetical order.
3. `GET /carrels?sort=colour` should reject unsupported sort field with HTTP 400 and exact message: `"Cannot sort by that field"`.
4. `GET /carrels?sort=name&order=invalid` should reject invalid sort direction with HTTP 400.
5. `GET /carrels?zone=A&sort=name&order=asc` should filter by zone and sort simultaneously.

### Suite 6: Bookings JOIN API (23 Tests)
1. `GET /bookings` should retrieve bookings with SQL `INNER JOIN` containing `student_name` and `carrel_name`.
2. `GET /bookings/:id` should retrieve a single joined booking with associated names.
3. `GET /bookings/:id` should reject malformed ID (`"12abc"`) with HTTP 400.
4. `GET /bookings/:id` should reject decimal ID (`"1.5"`) with HTTP 400.
5. `POST /bookings` should create a valid booking with date-only `YYYY-MM-DD` (HTTP 201).
6. `POST /bookings` should create a valid booking with full ISO 8601 timestamp (HTTP 201).
7. `POST /bookings` should reject nonexistent student ID with HTTP 404.
8. `POST /bookings` should reject nonexistent carrel ID with HTTP 404.
9. `POST /bookings` should reject malformed `student_id` (`"12abc"`) with HTTP 400.
10. `POST /bookings` should reject decimal `student_id` (`1.5`) with HTTP 400.
11. `POST /bookings` should reject negative `student_id` (`-1`) with HTTP 400.
12. `POST /bookings` should reject zero `student_id` (`0`) with HTTP 400.
13. `POST /bookings` should reject empty `student_id` (`""`) with HTTP 400.
14. `POST /bookings` should reject malformed `carrel_id` (`"12abc"`) with HTTP 400.
15. `POST /bookings` should reject decimal `carrel_id` (`1.5`) with HTTP 400.
16. `POST /bookings` should reject negative `carrel_id` (`-1`) with HTTP 400.
17. `POST /bookings` should reject zero `carrel_id` (`0`) with HTTP 400.
18. `POST /bookings` should reject invalid text string date with HTTP 400.
19. `POST /bookings` should reject impossible calendar date `2026-02-30` with HTTP 400.
20. `POST /bookings` should reject impossible calendar date `2026-02-31` with HTTP 400.
21. `POST /bookings` should reject impossible calendar date `2026-13-01` (month 13) with HTTP 400.
22. `POST /bookings` should reject impossible calendar date `2026-04-31` (April has 30 days) with HTTP 400.
23. `POST /bookings` should reject impossible leap day in non-leap year `2026-02-29` with HTTP 400.

### Suite 7: Database Initialization & Restart Idempotency (3 Tests)
1. Re-running `initDatabase()` on an existing database produces zero duplicate records.
2. `initDatabase()` reliably seeds missing tables when database is partially populated (e.g., all bookings deleted).
3. `initDatabase()` safely restores individual deleted seed records (e.g. Student 1) without modifying user records or duplicating rows.

---

## 4. Test Isolation & Database Integrity

All automated tests execute with `process.env.DB_PATH` set to `tests/test_studyspot.db`.
- Setup hook (`before`) unlinks any stale test database and initializes a clean schema with sample seed data.
- Teardown hook (`after`) closes connection handles and unlinks the temporary file.
- The development database located at `database/data/studyspot.db` is never accessed, queried, or modified during test runs.
