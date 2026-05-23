CareConnect - Emergency Healthcare Staffing Platform
===================================================

CareConnect is a location-based platform that connects hospitals with nearby doctors and nurses for urgent temporary staffing needs.

This repository contains:

- `backend/` - Spring Boot 3.5.x (Java 25) REST API + WebSocket server using MySQL and JWT authentication.
- `frontend/` - Angular 17 SPA using module-based architecture (no standalone components).

## Tech Stack

- **Backend**: Java 25, Spring Boot 3.5.x, Spring Data JPA, Hibernate, Spring Security (JWT), WebSocket (STOMP), Maven.
- **Frontend**: Angular 17, TypeScript, RxJS, Angular Router.
- **Database**: MySQL 8.x.

## Project Structure

- `backend/`
  - `src/main/java/com/careconnect` - main application package
  - `config` - general configuration, WebSocket, OpenAPI
  - `security` - JWT, authentication, authorization
  - `controller` - REST controllers
  - `service` - business logic services
  - `repository` - Spring Data JPA repositories
  - `entity` - JPA entities
  - `dto` - data transfer objects
  - `websocket` - STOMP controllers and message models
  - `resources/` - `application.yml` and other configuration

- `frontend/`
  - (to be generated via Angular CLI, see below)
  - `src/app/core` - core services, interceptors, guards
  - `src/app/shared` - shared components, pipes, directives
  - `src/app/auth` - authentication module (login, registration)
  - `src/app/hospital` - hospital dashboard and request management
  - `src/app/staff` - doctor/nurse dashboard and nearby requests
  - `src/app/requests` - request details and acceptance flows
  - `src/app/notifications` - notification UI
  - `src/app/chat` - real-time chat module

## Backend Setup

1. Install Java 25 (or latest Java compatible with Spring Boot 3.5.x).
2. Install Maven 3.9+.
3. Create a MySQL database (e.g. `careconnect`) and user.
4. Update `backend/src/main/resources/application.yml` with your DB credentials.
5. From the `backend` directory, run:

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

## Frontend Setup (Angular 17)

The `frontend` project is designed for Angular 17 using the Angular CLI.

1. Install Node.js (LTS) and npm.
2. Install Angular CLI 17:

```bash
npm install -g @angular/cli@17
```

3. From the repository root, generate the Angular app into the `frontend` folder (if it does not exist yet):

```bash
ng new frontend --routing --style=scss --strict
```

4. Inside `frontend`, create the modules as described in this README:
   - `core`, `shared`, `auth`, `hospital`, `staff`, `requests`, `notifications`, `chat`

5. From the `frontend` directory, run:

```bash
npm install
npm start
```

The frontend will start on `http://localhost:4200` and communicate with the backend at `http://localhost:8080/api`.

## High-Level Features (MVP)

- Hospital registration and login.
- Doctor and nurse registration and login.
- Hospital can create emergency staffing requests specifying required doctors, nurses, salary, and location.
- Doctors and nurses can view nearby open requests based on their location.
- Request acceptance with strict slot control (only the required number of doctors/nurses can accept).
- Real-time chat between hospital and staff per request via WebSocket/STOMP.
- JWT-based authentication and role-based authorization.

## Next Steps

- Implement unit and integration tests.
- Add proper frontend components, routing, and UI for all modules.
- Add monitoring and observability (Actuator, Prometheus, Grafana).
- Add support for push/email/SMS notifications.
.....................................................................................................................................
commit -1