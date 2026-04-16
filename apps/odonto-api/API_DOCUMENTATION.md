# API Documentation

Base URL: `http://localhost:3000`

Authentication is required for all endpoints except `/auth/login`.
Pass the JWT token in the header: `Authorization: Bearer <token>`

## Authentication

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string"
  }
  ```

---

## Users

**Base Path**: `/users`
**Roles**: `ADMIN` only.

| Method   | Endpoint | Parameters     | Body            | Description                                     |
| :------- | :------- | :------------- | :-------------- | :---------------------------------------------- |
| `POST`   | `/`      | -              | `CreateUserDto` | Create a new user (Dentist, Receptionist, etc.) |
| `GET`    | `/`      | -              | -               | List all users in the clinic                    |
| `GET`    | `/:id`   | `id` (integer) | -               | Get details of a specific user                  |
| `PATCH`  | `/:id`   | `id` (integer) | `UpdateUserDto` | Update user details                             |
| `DELETE` | `/:id`   | `id` (integer) | -               | Remove a user                                   |

**DTOs**:

- `CreateUserDto`: `{ name, email, password, role }`
- `UpdateUserDto`: `{ name?, email?, password?, role? }`

---

## Patients

**Base Path**: `/patients`

| Method   | Endpoint | Roles                        | Parameters | Body               | Description            |
| :------- | :------- | :--------------------------- | :--------- | :----------------- | :--------------------- |
| `POST`   | `/`      | `ADMIN`, `SIMPLE`, `DENTIST` | -          | `CreatePatientDto` | Register a new patient |
| `GET`    | `/`      | `ADMIN`, `SIMPLE`, `DENTIST` | -          | -                  | List all patients      |
| `GET`    | `/:id`   | `ADMIN`, `SIMPLE`, `DENTIST` | `id` (int) | -                  | Get patient details    |
| `PATCH`  | `/:id`   | `ADMIN`, `SIMPLE`, `DENTIST` | `id` (int) | `UpdatePatientDto` | Update patient info    |
| `DELETE` | `/:id`   | `ADMIN`                      | `id` (int) | -                  | Remove a patient       |

**DTOs**:

- `CreatePatientDto`: `{ name, email?, phone?, birthDate?, address? }`

---

## Appointments

**Base Path**: `/appointments`

| Method   | Endpoint | Roles                        | Parameters | Body                   | Description                                  |
| :------- | :------- | :--------------------------- | :--------- | :--------------------- | :------------------------------------------- |
| `POST`   | `/`      | `ADMIN`, `SIMPLE`            | -          | `CreateAppointmentDto` | Schedule an appointment                      |
| `GET`    | `/`      | `ADMIN`, `SIMPLE`, `DENTIST` | -          | -                      | List appointments (Dentists see only theirs) |
| `GET`    | `/:id`   | `ADMIN`, `SIMPLE`, `DENTIST` | `id` (int) | -                      | Get appointment details                      |
| `PATCH`  | `/:id`   | `ADMIN`, `SIMPLE`            | `id` (int) | `UpdateAppointmentDto` | Reschedule/Update appointment                |
| `DELETE` | `/:id`   | `ADMIN`, `SIMPLE`            | `id` (int) | -                      | Cancel/Remove appointment                    |

**DTOs**:

- `CreateAppointmentDto`: `{ patientId, dentistId, date, notes? }`
