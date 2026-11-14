# StudySpot Cafe — Study Carrel Booking Management System
**Course:** Backend Development Fundamentals  
**Group:** Group 4  

---

## 1. Project Overview

**StudySpot Cafe** is a specialized study cafe offering dedicated, quiet study carrels (booths/cubicles) that students can reserve for productive, uninterrupted study sessions. 

Managing study carrels manually or through ad-hoc methods leads to double bookings, inefficient space utilization, and lack of visibility into student reservations. To resolve these challenges, **Group 4** developed a high-performance, modular, and fully integrated Node.js and Express REST API backend backed by an SQLite relational database with strict foreign-key enforcement, automated validation, zone-based search, deterministic sorting, and relational JOIN operations.

---

## 2. Problem Statement

Modern campus cafes and study centers struggle with:
- Managing high-demand study spaces across distinct noise and activity zones (e.g., Silent Study, Collaborative, Focus pods).
- Preventing accidental record loss or orphaned booking records when modifying space inventories.
- Providing consistent, queryable APIs that enable clients to filter carrels by zone and sort carrels alphabetically without security risks such as SQL injection.
- Ensuring that booking records present full relational data (such as student names and carrel names) seamlessly in one roundtrip using SQL JOINs rather than forcing clients to make multiple N+1 API calls.

This project delivers a complete backend solution meeting every Group 4 faculty assignment specification.

---

## 3. Technologies Used

- **Runtime:** Node.js (v18+ / v20+ / v26+)
- **Architecture:** Express.js REST API
- **Language:** JavaScript (CommonJS standard)
- **Database:** SQLite3 via `sqlite3` driver
- **Foreign Key Constraints:** SQLite `PRAGMA foreign_keys = ON;`
- **Testing Engine:** Node.js native test runner (`node:test`, `node:assert`)
- **API Test Suite:** Supertest
- **API Documentation & Testing:** Postman Collection v2.1

---

## 4. Key Application Features

1. **Modular 5-Member Architecture:** Strictly segregated code organization reflecting independent yet harmonious module development.
2. **Relational Database with Foreign Key Enforcement:** `students`, `carrels`, and `bookings` tables bound with relational foreign keys.
3. **Idempotent Database Initialization:** Automatic table creation and sample record seeding with duplicate prevention on server restarts.
4. **Complete Carrel CRUD:** Full Create, Read, Update, and Delete operations for study carrels.
5. **Conflict-Safe Deletions:** Preserves booking integrity by blocking deletions of carrels that are referenced by existing bookings (`HTTP 409 Conflict`).
6. **Input Validation:** Strict sanitization, whitespace trimming, and error message reporting for all entities.
7. **Zone-Based Search:** Case-insensitive search allowing students to filter carrels by study zone (e.g., Zone A, B, C).
8. **Deterministic Sorting:** Allowlist-secured sorting by carrel name in both ascending (`asc`) and descending (`desc`) order, rejecting illegal sort fields with exact error responses.
9. **SQL JOIN Bookings API:** Direct relational `INNER JOIN` query returning combined booking, student, and carrel information.
10. **Comprehensive Automated Test Suite:** 36 automated tests running against an isolated temporary test database without altering development data.

---

## 5. Five-Member Responsibility Allocation

| Member | Focus Area | Key Responsibilities | Primary Files |
|---|---|---|---|
| **Member 1** | **Backend Setup & Routing** | Express application setup, JSON middleware, route registration, student controller, centralized error handling, and 404 handler. | `member-1/backend-setup-routing/` |
| **Member 2** | **Database Management** | SQLite configuration, schema creation, foreign key enforcement, database seeding, query helper wrappers, and connection lifecycle. | `member-2/database-management/` |
| **Member 3** | **Carrel CRUD Operations** | Implementation of GET, POST, PUT, DELETE endpoints for carrels, database integration, conflict handling, and controller response formatting. | `member-3/carrel-crud/` |
| **Member 4** | **Validation, Search & Sorting** | Middleware validation for carrels, students, and bookings; ISO 8601 date validation; zone filtering; allowlist-based sorting; parameter sanitization. | `member-4/validation-search-sorting/` |
| **Member 5** | **Bookings JOIN, Testing & Docs** | Bookings SQL JOIN implementation, foreign key validation, Postman collection, automated `node:test` + Supertest test suite, and README documentation. | `member-5/` |

---

## 6. Project Directory Structure

```text
project distribution/
│
├── member-1/
│   └── backend-setup-routing/
│       ├── app.js                          # Express application configuration & middleware
│       ├── server.js                       # Server entrypoint with DB initialization
│       ├── routes/
│       │   ├── studentRoutes.js            # Routes for student endpoints
│       │   ├── carrelRoutes.js             # Routes for carrel CRUD endpoints
│       │   └── bookingRoutes.js            # Routes for booking endpoints
│       ├── controllers/
│       │   └── studentController.js        # Controller for student operations
│       └── middleware/
│           ├── errorHandler.js             # Centralized error handler
│           └── notFound.js                 # 404 handler for undefined routes
│
├── member-2/
│   └── database-management/
│       ├── database.js                     # SQLite connection, query helpers, and lifecycle
│       ├── schema.sql                      # SQL DDL table creation statements
│       ├── seed.sql                        # SQL DML sample data records
│       └── data/
│           └── .gitkeep                    # Directory tracking for runtime DB files
│
├── member-3/
│   └── carrel-crud/
│       └── carrelController.js             # Carrel CRUD controller integrating Member 2 & 4
│
├── member-4/
│   └── validation-search-sorting/
│       ├── carrelValidation.js             # Validation middleware for carrel data & IDs
│       ├── studentValidation.js            # Validation middleware for student data
│       ├── bookingValidation.js            # Validation middleware for booking data & ISO 8601
│       ├── carrelSearch.js                 # Zone filtering SQL builder
│       └── carrelSorting.js                # Allowlist sorting validator & SQL ORDER BY builder
│
├── member-5/
│   ├── bookings-join/
│   │   └── bookingController.js            # Booking controller with SQL JOIN queries
│   ├── tests/
│   │   ├── api.test.js                     # Comprehensive 36-test API test suite
│   │   └── testSetup.js                    # Isolated temporary test database harness
│   └── postman/
│       └── StudySpot.postman_collection.json # Importable Postman v2.1 collection
│
├── package.json                            # Root NPM configuration & scripts
├── package-lock.json                       # Locked dependency tree
├── .gitignore                              # Excludes SQLite database files, node_modules, logs
└── README.md                               # Complete system documentation
```

---

## 7. Database Schema & Relationships

### 7.1 Entity-Relationship Overview

```
 +--------------------+             +--------------------+
 |      STUDENTS      |             |      CARRELS       |
 +--------------------+             +--------------------+
 | id (PK, INTEGER)   |             | id (PK, INTEGER)   |
 | name (TEXT, NN)    |             | name (TEXT, NN)    |
 | email (TEXT)       |             | zone (TEXT, NN)    |
 +---------+----------+             +---------+----------+
           |                                  |
           | 1                                | 1
           |                                  |
           | N                                | N
 +---------v----------------------------------v----------+
 |                        BOOKINGS                       |
 +-------------------------------------------------------+
 | id (PK, INTEGER)                                      |
 | student_id (FK -> students.id, ON DELETE RESTRICT)    |
 | carrel_id (FK -> carrels.id, ON DELETE RESTRICT)      |
 | booking_date (TEXT, NN)                               |
 +-------------------------------------------------------+
```

### 7.2 Tables Specification

#### 1. `students` Table
| Column | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique student identifier |
| `name` | TEXT | NOT NULL | Full name of the student |
| `email` | TEXT | Optional | Email address of the student |

#### 2. `carrels` Table
| Column | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique carrel identifier |
| `name` | TEXT | NOT NULL | Carrel room/desk label (e.g. "Carrel A-1") |
| `zone` | TEXT | NOT NULL | Study zone location (e.g. "A", "B", "C") |

#### 3. `bookings` Table
| Column | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique booking identifier |
| `student_id` | INTEGER | NOT NULL, FOREIGN KEY | References `students(id)` ON DELETE RESTRICT |
| `carrel_id` | INTEGER | NOT NULL, FOREIGN KEY | References `carrels(id)` ON DELETE RESTRICT |
| `booking_date` | TEXT | NOT NULL | Scheduled booking date in ISO 8601 format |

### 7.3 Foreign Key Enforcement
SQLite disables foreign keys by default. On connection startup, the database management layer runs:
```sql
PRAGMA foreign_keys = ON;
```
This guarantees that invalid references are rejected and carrels with active bookings cannot be deleted without first removing the dependent bookings.

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (Node Package Manager)

### Step 1: Install Dependencies
From the project root directory, install the required packages:

```bash
npm install
```

This installs:
- `express` (Application framework)
- `sqlite3` (Database driver)
- `supertest` (API testing utility in devDependencies)

---

## 9. Database Initialization

The application automatically verifies and initializes the database when the server starts up.

- Tables are created via `member-2/database-management/schema.sql`.
- If the database tables are empty, sample seed records from `member-2/database-management/seed.sql` are loaded.
- To prevent duplicate records upon restart, `database.js` inspects table row counts and only executes seeds when tables are newly created.
- The development database file is stored at:
  `member-2/database-management/data/studyspot.db`
  *(This file is safely ignored by Git via `.gitignore`)*.

---

## 10. Running the Server

Start the application:

```bash
npm start
```

Or run via node:

```bash
node member-1/backend-setup-routing/server.js
```

### Configurable Port
By default, the server listens on port `3000`. You can configure a custom port via the `PORT` environment variable:

```bash
# On Linux/macOS
PORT=5000 npm start

# On Windows PowerShell
$env:PORT="5000"; npm start
```

Expected startup output:
```text
Initializing SQLite database...
Database schema and seed data verified.
StudySpot Cafe server is running on port 3000
Base URL: http://localhost:3000
```

---

## 11. API Endpoint Reference

All endpoints return uniform, structured JSON responses.

### 11.1 Students API

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/students` | Retrieve all students | `200 OK` |
| `GET` | `/students/:id` | Retrieve student by ID | `200 OK` / `404 Not Found` |
| `POST` | `/students` | Register a new student | `201 Created` / `400 Bad Request` |

### 11.2 Carrels API (CRUD, Search & Sorting)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/carrels` | Retrieve all carrels | `200 OK` |
| `GET` | `/carrels?zone=:zone` | Search carrels by zone | `200 OK` |
| `GET` | `/carrels?sort=name&order=asc` | Sort carrels A to Z | `200 OK` |
| `GET` | `/carrels?sort=name&order=desc` | Sort carrels Z to A | `200 OK` |
| `GET` | `/carrels?zone=:zone&sort=name&order=:order` | Combined search & sort | `200 OK` |
| `GET` | `/carrels/:id` | Retrieve carrel by ID | `200 OK` / `404 Not Found` |
| `POST` | `/carrels` | Create new carrel | `201 Created` / `400 Bad Request` |
| `PUT` | `/carrels/:id` | Update carrel | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/carrels/:id` | Delete carrel | `200 OK` / `404 Not Found` / `409 Conflict` |

### 11.3 Bookings API (SQL JOIN)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/bookings` | Retrieve all bookings with joined student and carrel names | `200 OK` |
| `GET` | `/bookings/:id` | Retrieve a single booking with joined names | `200 OK` / `404 Not Found` |
| `POST` | `/bookings` | Create a booking | `201 Created` / `400 Bad Request` / `404 Not Found` |

---

## 12. Request and Response Examples

### 12.1 Create Carrel
**Request:**
```http
POST /carrels HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Silent Study Room",
  "zone": "A"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Carrel created successfully",
  "data": {
    "id": 11,
    "name": "Silent Study Room",
    "zone": "A"
  }
}
```

### 12.2 Zone-Based Search
**Request:**
```http
GET /carrels?zone=A HTTP/1.1
Host: localhost:3000
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Carrels retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Carrel A-1",
      "zone": "A"
    },
    {
      "id": 2,
      "name": "Carrel A-2",
      "zone": "A"
    },
    {
      "id": 3,
      "name": "Carrel A-3",
      "zone": "A"
    },
    {
      "id": 4,
      "name": "Carrel A-4",
      "zone": "A"
    }
  ]
}
```

### 12.3 Ascending Sorting (A to Z)
**Request:**
```http
GET /carrels?sort=name&order=asc HTTP/1.1
Host: localhost:3000
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Carrels retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Carrel A-1",
      "zone": "A"
    },
    {
      "id": 2,
      "name": "Carrel A-2",
      "zone": "A"
    },
    {
      "id": 3,
      "name": "Carrel A-3",
      "zone": "A"
    },
    {
      "id": 5,
      "name": "Carrel B-1",
      "zone": "B"
    }
  ]
}
```

### 12.4 Descending Sorting (Z to A)
**Request:**
```http
GET /carrels?sort=name&order=desc HTTP/1.1
Host: localhost:3000
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Carrels retrieved successfully",
  "data": [
    {
      "id": 10,
      "name": "Carrel C-3",
      "zone": "C"
    },
    {
      "id": 9,
      "name": "Carrel C-2",
      "zone": "C"
    },
    {
      "id": 8,
      "name": "Carrel C-1",
      "zone": "C"
    }
  ]
}
```

### 12.5 Invalid Sorting Field (Mandatory Error Response)
**Request:**
```http
GET /carrels?sort=colour HTTP/1.1
Host: localhost:3000
```

**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Cannot sort by that field"
}
```

### 12.6 Combined Search and Sorting
**Request:**
```http
GET /carrels?zone=A&sort=name&order=asc HTTP/1.1
Host: localhost:3000
```

**Response (`200 OK`):**
Filters carrels strictly to Zone A and sorts them in ascending alphabetical order.

### 12.7 Bookings SQL JOIN
**Request:**
```http
GET /bookings HTTP/1.1
Host: localhost:3000
```

**Actual SQL Executed:**
```sql
SELECT 
    b.id AS id,
    b.booking_date AS booking_date,
    b.student_id AS student_id,
    s.name AS student_name,
    b.carrel_id AS carrel_id,
    c.name AS carrel_name
FROM bookings b
JOIN students s ON b.student_id = s.id
JOIN carrels c ON b.carrel_id = c.id
ORDER BY b.id ASC;
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "booking_date": "2026-11-20",
      "student_id": 1,
      "student_name": "Alice Johnson",
      "carrel_id": 1,
      "carrel_name": "Carrel A-1"
    },
    {
      "id": 2,
      "booking_date": "2026-11-21",
      "student_id": 2,
      "student_name": "Bob Smith",
      "carrel_id": 2,
      "carrel_name": "Carrel A-2"
    },
    {
      "id": 3,
      "booking_date": "2026-11-22",
      "student_id": 3,
      "student_name": "Clara Zhang",
      "carrel_id": 5,
      "carrel_name": "Carrel B-1"
    }
  ]
}
```

### 12.8 Foreign-Key Conflict on Carrel Deletion
**Request:**
```http
DELETE /carrels/1 HTTP/1.1
Host: localhost:3000
```

**Response (`409 Conflict`):**
```json
{
  "success": false,
  "message": "Cannot delete carrel: existing bookings are associated with this carrel"
}
```

---

## 13. Validation Rules

Member 4 enforces input validation via Express middleware:

1. **Carrel Validation (`POST /carrels`, `PUT /carrels/:id`):**
   - `name`: Must be a non-empty string and not whitespace-only. Trims leading/trailing whitespace.
   - `zone`: Must be a non-empty string and not whitespace-only. Trims leading/trailing whitespace.
   - `id` (Route Parameter): Must be a valid positive integer (`1`, `2`, `10`). Rejects malformed values (`12abc`, `1.5`, `-1`, `0`, empty strings) with `HTTP 400`.
   - If invalid, returns `HTTP 400`:
     ```json
     {
       "success": false,
       "message": "Validation failed",
       "errors": [
         "Carrel name is required"
       ]
     }
     ```
2. **Student Validation (`POST /students`):**
   - `name`: Required non-empty string.
   - `email`: Optional; if provided, must match valid email format (`regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - `id` (Route Parameter): Validated via `validateIdParam` rejecting non-integers, decimals, and negative values.
3. **Booking Validation (`POST /bookings`):**
   - `student_id`: Required positive integer. Rejects malformed values (`12abc`, `1.5`, `-1`, `0`, `""`) with `HTTP 400`.
   - `carrel_id`: Required positive integer. Rejects malformed values (`12abc`, `1.5`, `-1`, `0`, `""`) with `HTTP 400`.
   - `booking_date`: Required valid calendar date in ISO 8601 format (`YYYY-MM-DD` or full ISO timestamp). Accurately accounts for leap years and rejects impossible calendar dates (such as `2026-02-30`, `2026-02-31`, `2026-13-01`, `2026-04-31`, or non-leap `2026-02-29`) with `HTTP 400`.
   - Foreign references: Verified against the database; returns `HTTP 404` if the referenced student or carrel does not exist.

---

## 14. Postman Collection

The official Group 4 Postman collection is stored at:
`member-5/postman/StudySpot.postman_collection.json`

### Import Instructions
1. Open the Postman desktop application or Postman Web.
2. Click **Import** (top left).
3. Select or drag-and-drop `member-5/postman/StudySpot.postman_collection.json`.
4. Ensure the collection variable `baseUrl` is set to `http://localhost:3000`.
5. Execute requests across the 5 structured folders:
   - `1. Students`
   - `2. Carrels`
   - `3. Bookings`
   - `4. Search and Sorting`
   - `5. Validation and Error Handling`

Every request includes pre-configured assertions verifying status codes, response shapes, and specific error messages.

---

## 15. Automated Testing

Automated testing is powered by Node.js's built-in test runner (`node:test`) and `supertest`.

### Isolated Test Database Guarantee
The test suite utilizes `member-5/tests/testSetup.js` which points `process.env.DB_PATH` to an isolated temporary database:
`member-5/tests/test_studyspot.db`.
- Tests **never** modify or delete data in the development database.
- The temporary test database is cleaned up upon test suite completion.

### Running the Tests
Execute the test command from the project root:

```bash
npm test
```

Or run directly via Node:

```bash
node --test member-5/tests/api.test.js
```

### Test Coverage Summary (65 Passing Tests across 8 Suites)
- **General Routing & Health Check:** Root health check (`/`), 404 handler for undefined routes.
- **Students API:** Retrieve all students, retrieve by ID, handle nonexistent ID (404), create student, reject missing name (400), reject invalid email (400), reject malformed IDs (`12abc`, `1.5`, `-1`, `0`).
- **Carrel CRUD:** Retrieve all, retrieve by ID, nonexistent carrel (404), create carrel (201), update carrel (200), nonexistent update (404), delete carrel without bookings (200), nonexistent delete (404), foreign-key conflict rejection on carrel with bookings (409), reject malformed IDs across GET, PUT, and DELETE (`12abc`, `1.5`, `-1`, `0`).
- **Carrel Validation:** Reject missing name, reject missing zone, reject empty string, reject whitespace-only.
- **Zone-Based Search:** Search Zone A, search Zone B, search nonexistent zone (returns `[]` with 200), query without zone.
- **Sorting:** Ascending A to Z order, descending Z to A order, reject invalid sort field with exact message `"Cannot sort by that field"`, reject invalid sort direction (400), combined zone search and sorting.
- **Bookings JOIN API:** Retrieve bookings with SQL JOIN, verify `student_name` and `carrel_name` presence, retrieve by ID, create valid booking with date-only `YYYY-MM-DD` (201), create valid booking with full ISO 8601 timestamp (201), reject nonexistent student (404), reject nonexistent carrel (404), reject malformed student IDs (`12abc`, `1.5`, `-1`, `0`, `""`), reject malformed carrel IDs (`12abc`, `1.5`, `-1`, `0`), reject invalid date strings (400), reject impossible calendar dates (`2026-02-30`, `2026-02-31`, `2026-13-01`, `2026-04-31`, `2026-02-29`).
- **Database Initialization & Idempotency:** Verification of repeatable, duplicate-free initialization upon restart and robust handling of partially populated databases.

---

## 16. Group 4 Conclusion & Compliance

This implementation meets all faculty requirements for Group 4:
- Five distinct member modules integrated into a single cohesive application.
- Clean separation of concerns with CommonJS standards throughout.
- Complete SQLite relational database with seed data, parameterized queries, and foreign-key integrity.
- Production-grade error handling, automated testing, and comprehensive documentation.
