# StudySpot Cafe — Member 4 Technical Guide & Viva Preparation
**Study Carrel Booking Management System**  
**Course:** Backend Development Fundamentals  
**University:** Aurora Deemed to be University  
**Group:** Group 4  
**Member:** Member 4  
**Student Name:** Bhardwaj  
**Registration Number:** 252U1R1236  
**Assigned Responsibility:** Input Validation, Route Parameter Validation, Zone-Based Search, and Allowlisted Sorting  
**Repository Branch:** `member-4-validation`

---

## 1. Executive Summary & Role Overview

As **Member 4**, your assigned responsibility in the StudySpot Cafe backend project is to serve as the **gatekeeper and organizer of the system**. 

When students and study carrels are created, or when reservations are booked, external users send data across the network into the backend API. If incoming data is missing, incorrect, malformed, or malicious, the backend could crash, corrupt the database, or create impossible records (such as reserving a carrel on February 30th).

Your code guarantees that:
1. **Bad or malformed data is stopped at the door** (returning HTTP 400 Bad Request with helpful error messages).
2. **Database IDs are strictly positive whole numbers** (rejecting decimals, letters, negatives, zero, and huge unsafe numbers).
3. **Booking dates are genuine calendar dates** (accounting for leap years and exact month lengths, supporting both `YYYY-MM-DD` and ISO 8601 timestamps).
4. **Students can find carrels by zone** (e.g., Zone A, B, C) using secure parameterized database queries.
5. **Carrel lists can be sorted safely** by name in ascending (`asc`) or descending (`desc`) order, while rejecting unsupported fields (like `sort=colour`) with the exact faculty-required error message: `"Cannot sort by that field"`.

---

## 2. Core Concepts Explained in Plain English

### What is Input Validation and Why Does it Protect the Database?
Think of input validation like the security check at an airport. Before anyone enters the terminal, security verifies that the passenger has a real ticket and that their luggage contains no hazardous items. 
In a web application:
- A user sends data to an endpoint (such as `POST /students`).
- If the name is blank or missing, or if the email is gibberish (`not-an-email`), the validation middleware intercepts the request **before** it touches the database.
- It immediately sends back an **HTTP 400 Bad Request** error with an explanation of what was wrong.
- This prevents the database from storing empty names, broken emails, or crashing due to SQL constraints.

### What is a Positive Integer and Why Must Route IDs Be Validated?
In our SQLite database, primary keys (`id`) are positive counting numbers: `1, 2, 3, 4, ...`.
- Numbers like `1.5` (a decimal / float), `-1` (negative), `0` (zero), or `"12abc"` (alphanumeric string) are **not** valid primary keys.
- If a user sends `GET /carrels/12abc` or `GET /carrels/1.5`, we do not want to execute a query against SQLite looking for an impossible record.
- We validate `:id` using a regular expression (`/^[1-9]\d*$/`) and JavaScript's `Number.isSafeInteger(id)` to ensure it is a safe, strictly positive integer. If not, we return **HTTP 400** with:
  ```json
  {
    "success": false,
    "message": "Invalid ID parameter. ID must be a positive integer"
  }
  ```

### How Do Calendar Dates Differ from Simple Date Format Strings?
A regular expression can check whether a string has the pattern `YYYY-MM-DD` (four digits, hyphen, two digits, hyphen, two digits). But just matching the pattern does **not** mean the date actually exists on the calendar!
- For example, `2026-02-30` matches `\d{4}-\d{2}-\d{2}`. But February never has 30 days!
- If you pass `'2026-02-30'` to standard JavaScript `new Date('2026-02-30')`, JavaScript silently "rolls over" the date into `March 2nd`!
- That silent rollover is dangerous for a booking system because a student thinking they booked for February 30th would actually have a booking created on March 2nd without realizing it.
- **Our Calendar Validator (`isValidCalendarDate`)** explicitly checks:
  1. Month must be between 1 and 12.
  2. The maximum number of days in that specific month (e.g., April, June, Sept, Nov have 30; Jan, Mar, May, Jul, Aug, Oct, Dec have 31).
  3. **Leap year calculation**: If the year is divisible by 4, not divisible by 100 unless also divisible by 400. In a leap year (e.g., 2024, 2028), February has 29 days. In a non-leap year (e.g., 2026), February has only 28 days.
  4. Therefore, `2026-02-29`, `2026-02-30`, `2026-04-31`, and `2026-13-01` are correctly rejected with **HTTP 400**.

### What Does Zone-Based Search Do?
Study carrels in the cafe are grouped into quiet study zones: Zone A, Zone B, and Zone C.
When a student wants to see only carrels in Zone A, they send:
`GET /carrels?zone=A`
- Our utility (`utils/carrelSearch.js`) extracts the `zone` parameter from `req.query`.
- It builds a SQL condition: `WHERE UPPER(zone) = UPPER(?)` and passes `['A']` as a parameterized value.
- **SQL Parameterization** ensures user input is passed as a pure data value to the database driver, never concatenated into the raw SQL string. This prevents **SQL Injection**.
- It is case-insensitive, so `GET /carrels?zone=a` matches `Zone A`.
- If the zone does not exist (e.g. `GET /carrels?zone=NonExistent`), it returns **HTTP 200** with an empty list `[]`.
- If no zone is provided, it returns all carrels.

### What is Allowlisted Sorting and Why is it Necessary?
When querying carrels, users can sort the list alphabetically or in reverse order:
- `GET /carrels?sort=name&order=asc` (A to Z)
- `GET /carrels?sort=name&order=desc` (Z to A)

**Why can't we just write `ORDER BY ? ?` in SQL?**
In SQL prepared statements, placeholders (`?`) can only replace **data values** (like strings or numbers in a `WHERE` clause). Placeholders **cannot** be used for column names or SQL keywords like `ORDER BY` or `ASC/DESC`.

If developers concatenate `req.query.sort` directly into a query:
`SELECT * FROM carrels ORDER BY ` + req.query.sort;
An attacker could pass:
`GET /carrels?sort=name; DROP TABLE carrels;--`
This is a fatal **SQL Injection** attack!

To solve this completely, we use an **Allowlist (Whitelist)**:
- We define an array of permitted fields: `ALLOWED_SORT_FIELDS = ['name']`.
- We define an array of permitted orders: `ALLOWED_ORDERS = ['asc', 'desc']`.
- If a user passes an unpermitted sort field, such as `GET /carrels?sort=colour`, our code immediately rejects the request with **HTTP 400** and the exact required message:
  ```json
  {
    "success": false,
    "message": "Cannot sort by that field"
  }
  ```

---

## 3. Architecture & File Breakdown

| File | Purpose | Key Functions / Responsibilities |
| :--- | :--- | :--- |
| `validation/studentValidation.js` | Validates student creation requests (`POST /students`). | Checks that `name` is a non-empty string, trims whitespace, verifies optional `email` format via regex, ensures request body is a JSON object. |
| `validation/carrelValidation.js` | Validates carrel creation/update and URL `:id` parameters. | `validateCarrel`: Checks `name` and `zone` are non-empty strings and trims them.<br>`validateIdParam`: Middleware verifying route parameter `:id` is a strictly positive integer. |
| `validation/bookingValidation.js` | Validates booking requests (`POST /bookings`). | `validateBooking`: Ensures `student_id` and `carrel_id` are positive integers.<br>`isValidBookingDate` & `isValidCalendarDate`: Validates date strings (`YYYY-MM-DD` and ISO 8601 timestamps), enforces leap year rules and calendar month limits. |
| `utils/carrelSearch.js` | Builds SQL queries for filtering carrels by zone. | `buildZoneFilter`: Takes `req.query`, cleans `zone`, and returns a safe SQL `WHERE UPPER(zone) = UPPER(?)` clause with parameterized values. |
| `utils/carrelSorting.js` | Validates sorting parameters and generates `ORDER BY` clauses. | `buildSortClause`: Validates `sort` against `['name']` and `order` against `['asc', 'desc']`. Rejects unsupported fields with exact error message `"Cannot sort by that field"`. Appends `id ASC` for deterministic order. |
| `middleware/errorHandler.js` | Centralized application error handling. | Catches uncaught errors and syntax errors (e.g., malformed JSON), formats responses consistently into `{ success: false, message: ... }`, and shields database internals. |
| `middleware/notFound.js` | Catches unmapped routes. | Returns uniform **HTTP 404** with `{ success: false, message: "Resource not found: ..." }`. |

---

## 4. How to Run the Project & Run the Tests

### Step 1: Install Dependencies
Open your PowerShell or terminal in the project folder and run:
```bash
npm install
```

### Step 2: Run the Automated Test Suite
To execute all automated unit and integration tests:
```bash
npm test
```
**Expected Result:**
```text
# tests 70
# suites 8
# pass 70
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
All 70 tests pass with zero failures!

### Step 3: Start the Live Server
To start the application:
```bash
npm start
```
The server will initialize SQLite and log:
```text
Initializing SQLite database...
Database schema and seed data verified.
StudySpot Cafe server is running on port 3000
Base URL: http://localhost:3000
```

---

## 5. Live Endpoint Verification & Postman Testing

You can test every Member 4 feature using Postman or `curl` against `http://localhost:3000`:

### Demonstration 1: Filter Carrels by Zone
- **Request:** `GET http://localhost:3000/carrels?zone=A`
- **Status:** `200 OK`
- **Output:** Only returns carrels belonging to Zone A (`Carrel A-1`, `Carrel A-2`, `Carrel A-3`, `Carrel A-4`).

### Demonstration 2: Sort Carrels Alphabetically (A to Z)
- **Request:** `GET http://localhost:3000/carrels?sort=name&order=asc`
- **Status:** `200 OK`
- **Output:** Returns all carrels arranged alphabetically from `Carrel A-1` through `Carrel C-3`.

### Demonstration 3: Sort Carrels in Reverse Alphabetical Order (Z to A)
- **Request:** `GET http://localhost:3000/carrels?sort=name&order=desc`
- **Status:** `200 OK`
- **Output:** Returns carrels starting with `Carrel C-3` down to `Carrel A-1`.

### Demonstration 4: Unsupported Sort Field Rejection
- **Request:** `GET http://localhost:3000/carrels?sort=colour`
- **Status:** `400 Bad Request`
- **Response Body:**
  ```json
  {
    "success": false,
    "message": "Cannot sort by that field"
  }
  ```

### Demonstration 5: Route Parameter Positive Integer Validation
- **Request:** `GET http://localhost:3000/carrels/12abc`
- **Status:** `400 Bad Request`
- **Response Body:**
  ```json
  {
    "success": false,
    "message": "Invalid ID parameter. ID must be a positive integer"
  }
  ```
*(Also test with `0`, `-1`, and `1.5` — all return HTTP 400).*

### Demonstration 6: Impossible Calendar Date Rejection
- **Request:** `POST http://localhost:3000/bookings`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "student_id": 1,
    "carrel_id": 1,
    "booking_date": "2026-02-30"
  }
  ```
- **Status:** `400 Bad Request`
- **Response Body:**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      "Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)"
    ]
  }
  ```

---

## 6. Faculty Evaluation & Oral Viva Q&A

Here are the questions faculty members typically ask during practical evaluations, along with simple and clear answers you can give:

### Q1: What was your specific contribution to this group project?
> **Answer:** "I am Member 4. My primary responsibility was building the input validation layer, route parameter validation, zone-based search, and allowlisted sorting for the carrels. I created `validation/studentValidation.js`, `validation/carrelValidation.js`, `validation/bookingValidation.js`, `utils/carrelSearch.js`, and `utils/carrelSorting.js`."

### Q2: Why is validation handled in middleware rather than inside the controller functions?
> **Answer:** "Using Express middleware follows the Single Responsibility Principle and Separation of Concerns. Validation middleware inspects and sanitizes the incoming HTTP request first. If the request is invalid, it immediately responds with HTTP 400. This keeps the controller clean and focused only on business logic and database communication, preventing duplicated validation code."

### Q3: Why can't we just use `parseInt()` to validate route parameter IDs?
> **Answer:** "JavaScript's `parseInt('12abc', 10)` returns `12` instead of failing! It ignores the trailing letters. Additionally, `parseInt('1.5', 10)` returns `1`, stripping the decimal. If we relied only on `parseInt()`, malformed IDs like `12abc` or `1.5` would silently pass and look up ID `12` or `1`. Our validator uses regular expressions (`/^[1-9]\d*$/`) and `Number.isSafeInteger()` to guarantee the input is strictly digits only, positive, non-zero, and within safe memory limits."

### Q4: Why did you implement custom date validation instead of just using `new Date()`?
> **Answer:** "In JavaScript, `new Date('2026-02-30')` does not throw an error. Instead, it automatically overflows into `March 2nd`. For a booking system, that would create reservations on the wrong date without alerting the student. Our function `isValidCalendarDate` checks the actual month length and accounts for leap years, ensuring February only has 28 days in 2026 and rejecting impossible dates like February 30th or April 31st."

### Q5: What is SQL Injection and how did you prevent it in search and sorting?
> **Answer:** "SQL Injection occurs when untrusted user input is directly concatenated into a SQL statement, allowing an attacker to manipulate or destroy the database. 
- In **search**, we use **parameterized queries** (`WHERE UPPER(zone) = UPPER(?)`), where the database engine treats user input strictly as data, never executable code.
- In **sorting**, SQL does not allow parameters for `ORDER BY` column names. So we use an **allowlist** (`ALLOWED_SORT_FIELDS = ['name']`). If a user requests any field not in our allowlist—such as `colour` or malicious SQL commands—the request is rejected with HTTP 400 before any SQL is executed."

### Q6: What happens when someone queries `GET /carrels?sort=colour`?
> **Answer:** "Our sorting utility `buildSortClause` checks `sort=colour` against our allowlist. Because `colour` is not in `ALLOWED_SORT_FIELDS`, it returns HTTP 400 with the exact required message: `Cannot sort by that field`."

### Q7: What happens if a user searches for a zone that does not exist, like `GET /carrels?zone=Z`?
> **Answer:** "It returns HTTP 200 with an empty array `[]` in the data field. An empty search result is a normal, successful query (there are simply no carrels in Zone Z), not a server or client error."

### Q8: How did you verify your implementation?
> **Answer:** "We verified it in two ways:
1. Automated testing: We ran `npm test` using Node.js's native test runner (`node:test`) and Supertest, running 70 comprehensive test cases covering positive cases, boundary conditions, and negative error cases. All 70 passed.
2. Live testing: We started the server and verified all endpoints using HTTP requests, confirming the exact status codes and JSON responses."

---

## 7. Summary of Contributions for Submission

- **Branch:** `member-4-validation`
- **Validation Modules Created/Enhanced:**
  - `validation/studentValidation.js`
  - `validation/carrelValidation.js`
  - `validation/bookingValidation.js`
- **Utility Modules Created/Enhanced:**
  - `utils/carrelSearch.js`
  - `utils/carrelSorting.js`
- **Middleware Enhanced:**
  - `middleware/errorHandler.js`
  - `middleware/notFound.js`
- **Automated Tests:** 70 passing tests in `tests/api.test.js`
- **Documentation:** `docs/MEMBER_4_GUIDE.md`
- **All requirements met 100% with zero errors and zero skipped tests.**
