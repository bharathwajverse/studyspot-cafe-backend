# Live Faculty Demonstration Guide
## StudySpot Cafe – Study Carrel Booking Management System
**Course:** Backend Development Fundamentals | **Group:** Group 4  

---

## 1. Quick Start Commands

Open PowerShell or terminal in the project root directory:

```powershell
# 1. Cleanly install project dependencies
npm.cmd ci

# 2. Run the full automated test suite (verifies 68/68 passing tests)
npm.cmd test

# 3. Start the application server
npm.cmd start
```

**Expected Server Output:**
```text
Initializing SQLite database...
Database schema and seed data verified.
StudySpot Cafe server is running on port 3000
Base URL: http://localhost:3000
```

---

## 2. Dynamic Variable Management & Reliability

To ensure demonstration reliability across runs and varying database states, the Postman collection (`postman/StudySpot.postman_collection.json`) does **not** rely on hardcoded IDs (such as assuming IDs 6 and 11):

- **`createdStudentId`**: Automatically captured upon successful student registration in Step 3 (`POST /students`).
- **`createdCarrelId`**: Automatically captured upon successful carrel creation in Step 6 (`POST /carrels`).
- **`createdBookingId`**: Automatically captured upon successful booking creation in Step 13 (`POST /bookings`).
- **Collection Fallbacks**: Pre-initialized collection variables default to `"1"` so individual endpoints can be inspected standalone without error.

---

## 3. 18-Step Ordered Demonstration Sequence

Follow this step-by-step sequence in **Postman** (using `postman/StudySpot.postman_collection.json` with `{{baseUrl}}` set to `http://localhost:3000`) or via curl/PowerShell:

### Step 1: Start Application & Health Check
- **Endpoint:** `GET http://localhost:3000/`
- **Method:** `GET`
- **Postman Folder:** `0. Health & Status` -> `Health Check / API Status`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "success": true,
  "message": "StudySpot Cafe API is operational",
  "group": "Group 4",
  "course": "Backend Development Fundamentals"
}
```

---

### Step 2: Retrieve All Students
- **Endpoint:** `GET http://localhost:3000/students`
- **Method:** `GET`
- **Postman Folder:** `1. Students` -> `Get All Students`
- **Expected Status:** `200 OK`
- **Expected Response:** Array of 5 initial seed students (`Alice Johnson`, `Bob Smith`, `Clara Zhang`, `David Patel`, `Emma Wilson`).

---

### Step 3: Register a New Student (Dynamic ID Capture)
- **Endpoint:** `POST http://localhost:3000/students`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Postman Folder:** `1. Students` -> `Create Student (Valid)`
- **Request Body:**
```json
{
  "name": "Grace Hopper",
  "email": "grace.hopper@example.edu"
}
```
- **Postman Script Action:** Captures the newly generated `id` into `{{createdStudentId}}`.
- **Expected Status:** `201 Created`
- **Expected Response:** Newly assigned student object with dynamic `id`.

---

### Step 4: Retrieve Student Details by Dynamic ID
- **Endpoint:** `GET http://localhost:3000/students/{{createdStudentId}}`
- **Method:** `GET`
- **Postman Folder:** `1. Students` -> `Get Student By ID`
- **Expected Status:** `200 OK`
- **Expected Response:** Student object for `Grace Hopper` matching `{{createdStudentId}}`.

---

### Step 5: Retrieve All Study Carrels
- **Endpoint:** `GET http://localhost:3000/carrels`
- **Method:** `GET`
- **Postman Folder:** `2. Carrels` -> `Get All Carrels`
- **Expected Status:** `200 OK`
- **Expected Response:** Array of baseline carrels across Zones A, B, and C.

---

### Step 6: Create a New Carrel (Dynamic ID Capture)
- **Endpoint:** `POST http://localhost:3000/carrels`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Postman Folder:** `2. Carrels` -> `Create Carrel (Valid)`
- **Request Body:**
```json
{
  "name": "Carrel D-1",
  "zone": "D"
}
```
- **Postman Script Action:** Captures the newly generated `id` into `{{createdCarrelId}}`.
- **Expected Status:** `201 Created`
- **Expected Response:** Newly created carrel with dynamic `id`.

---

### Step 7: Retrieve a Carrel by Dynamic ID
- **Endpoint:** `GET http://localhost:3000/carrels/{{createdCarrelId}}`
- **Method:** `GET`
- **Postman Folder:** `2. Carrels` -> `Get Carrel By ID`
- **Expected Status:** `200 OK`
- **Expected Response:** Returns `{ id: {{createdCarrelId}}, name: "Carrel D-1", zone: "D" }`.

---

### Step 8: Update an Existing Carrel by Dynamic ID
- **Endpoint:** `PUT http://localhost:3000/carrels/{{createdCarrelId}}`
- **Method:** `PUT`
- **Headers:** `Content-Type: application/json`
- **Postman Folder:** `2. Carrels` -> `Update Carrel (Valid)`
- **Request Body:**
```json
{
  "name": "Quiet Focus Pod D-1",
  "zone": "D"
}
```
- **Expected Status:** `200 OK`
- **Expected Response:** Updated carrel with name `"Quiet Focus Pod D-1"`.

---

### Step 9: Search Carrels by Zone
- **Endpoint:** `GET http://localhost:3000/carrels?zone=A`
- **Method:** `GET`
- **Postman Folder:** `4. Search and Sorting` -> `Search Carrels By Zone A`
- **Expected Status:** `200 OK`
- **Expected Response:** Only carrels located in Zone A (`Carrel A-1`, `Carrel A-2`, `Carrel A-3`, `Carrel A-4`).

---

### Step 10: Sort Carrels Alphabetically (A to Z)
- **Endpoint:** `GET http://localhost:3000/carrels?sort=name&order=asc`
- **Method:** `GET`
- **Postman Folder:** `4. Search and Sorting` -> `Sort Carrels Ascending (A to Z)`
- **Expected Status:** `200 OK`
- **Expected Response:** Carrels returned strictly in ascending alphabetical order.

---

### Step 11: Sort Carrels Reverse Alphabetically (Z to A)
- **Endpoint:** `GET http://localhost:3000/carrels?sort=name&order=desc`
- **Method:** `GET`
- **Postman Folder:** `4. Search and Sorting` -> `Sort Carrels Descending (Z to A)`
- **Expected Status:** `200 OK`
- **Expected Response:** Carrels returned in reverse alphabetical order.

---

### Step 12: Demonstrate Mandatory Sort Field Error
- **Endpoint:** `GET http://localhost:3000/carrels?sort=colour`
- **Method:** `GET`
- **Postman Folder:** `4. Search and Sorting` -> `Sort By Invalid Field (Exact Error Message)`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
```json
{
  "success": false,
  "message": "Cannot sort by that field"
}
```

---

### Step 13: Create a Booking Linking Dynamic Student & Carrel
- **Endpoint:** `POST http://localhost:3000/bookings`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Postman Folder:** `3. Bookings` -> `Create Booking (Valid)`
- **Request Body:**
```json
{
  "student_id": {{createdStudentId}},
  "carrel_id": {{createdCarrelId}},
  "booking_date": "2026-12-01"
}
```
- **Postman Script Action:** Captures the newly created `id` into `{{createdBookingId}}`.
- **Expected Status:** `201 Created`
- **Expected Response:** Booking object containing `student_name: "Grace Hopper"` and `carrel_name: "Quiet Focus Pod D-1"`.

---

### Step 14: Retrieve All Bookings with Multi-Table SQL JOIN
- **Endpoint:** `GET http://localhost:3000/bookings`
- **Method:** `GET`
- **Postman Folder:** `3. Bookings` -> `Get All Bookings (JOIN)`
- **Expected Status:** `200 OK`
- **Expected Response:** Returns all bookings containing joined `student_name` and `carrel_name` without requiring secondary lookups.

---

### Step 15: Retrieve a Single Booking by Dynamic ID with JOIN
- **Endpoint:** `GET http://localhost:3000/bookings/{{createdBookingId}}`
- **Method:** `GET`
- **Postman Folder:** `3. Bookings` -> `Get Booking By ID`
- **Expected Status:** `200 OK`
- **Expected Response:** Booking matching `{{createdBookingId}}` joined with `student_name: "Grace Hopper"` and `carrel_name: "Quiet Focus Pod D-1"`.

---

### Step 16: Demonstrate Validation Error Handling (Impossible Calendar Date)
- **Endpoint:** `POST http://localhost:3000/bookings`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Postman Folder:** `5. Validation and Error Handling` -> `Booking Validation - Impossible Calendar Date (400)`
- **Request Body:**
```json
{
  "student_id": {{createdStudentId}},
  "carrel_id": {{createdCarrelId}},
  "booking_date": "2026-02-30"
}
```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
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

### Step 17: Demonstrate Foreign-Key Conflict on Deletion
- **Endpoint:** `DELETE http://localhost:3000/carrels/1`
- **Method:** `DELETE`
- **Postman Folder:** `2. Carrels` -> `Delete Carrel (Conflict With Existing Bookings)`
- **Expected Status:** `409 Conflict`
- **Expected Response:**
```json
{
  "success": false,
  "message": "Cannot delete carrel: existing bookings are associated with this carrel"
}
```
*(Carrel 1 is referenced by baseline booking #1; SQLite foreign-key protection safely prevents deletion).*

---

### Step 18: Demonstrate Successful Carrel Deletion (Unbooked)
- **Endpoint:** `DELETE http://localhost:3000/carrels/4`
- **Method:** `DELETE`
- **Postman Folder:** `2. Carrels` -> `Delete Carrel (Success - No Associated Bookings)`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "success": true,
  "message": "Carrel deleted successfully"
}
```
*(Carrel 4 has no associated bookings in seed data, allowing clean deletion without conflict).*

---

## 4. Postman Collection Runner Instructions

1. Open **Postman**.
2. Click **Collections** and select **StudySpot Cafe - Study Carrel Booking Management System**.
3. Click the **Run** button at the top right of the collection tab.
4. Select all folders (`0. Health & Status` through `5. Validation and Error Handling`).
5. Ensure `baseUrl` is set to `http://localhost:3000`.
6. Click **Run StudySpot Cafe...**.
7. Every test assertion will pass in automated sequence without requiring any manual variable edits.
