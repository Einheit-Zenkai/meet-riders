Of course! Based on the provided `README.md`, here is a prototype backend-specific README. It infers a potential project structure, API design, and configuration based on the choice of the Java Spring Framework and the application's features.

---

# Meet-Riders Backend

This repository contains the backend service for the Meet-Riders application. It is built with the **Java Spring Framework** and is responsible for all business logic, data persistence, and serving the RESTful API and WebSocket connections consumed by the frontend client.

## Table of Contents

- [Meet-Riders Backend](#meet-riders-backend)
  - [Table of Contents](#table-of-contents)
  - [Backend Features](#backend-features)
  - [Technology Stack](#technology-stack)
  - [Project Structure](#project-structure)
  - [API Documentation (Prototype)](#api-documentation-prototype)
    - [Authentication](#authentication)
    - [Users](#users)
    - [Parties](#parties)
    - [WebSocket Endpoints](#websocket-endpoints)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Configuration](#configuration)
    - [Running the Server](#running-the-server)

## Backend Features

*   **RESTful API:** A comprehensive API for managing users, parties, and application data.
*   **JWT-based Authentication:** Secure endpoints using Spring Security and JSON Web Tokens.
*   **Student Email Verification:** A dedicated flow for verifying users with a `.edu` email address.
*   **WebSocket Support:** Real-time communication for live chat within parties and GPS location tracking.
*   **Database Persistence:** Utilizes Spring Data JPA and Hibernate for object-relational mapping.
*   **Service-Oriented Architecture:** Business logic is decoupled into services for maintainability and testing.
*   **Integrated Build System:** Uses Gradle for dependency management and building the application.

## Technology Stack

*   **Framework:** Spring Boot 2.5+
*   **Language:** Java 11+
*   **Authentication:** Spring Security
*   **Database:** Spring Data JPA with Hibernate. Designed for PostgreSQL but compatible with other relational databases (like H2 for testing).
*   **Real-time:** Spring WebSocket
*   **Build Tool:** Gradle 7+
*   **Utilities:** Lombok (to reduce boilerplate code)

## Project Structure

The project follows a standard layered architecture pattern to separate concerns.

```
.
└── src
    └── main
        ├── java
        │   └── com
        │       └── meetriders
        │           ├── config      // Spring Security, WebSocket config
        │           ├── controller  // REST API controllers (entry points)
        │           ├── dto         // Data Transfer Objects for API requests/responses
        │           ├── exception   // Global exception handling
        │           ├── model       // JPA Entities (User, Party, Message, etc.)
        │           ├── repository  // Spring Data JPA repositories
        │           ├── security    // JWT generation, validation, and filters
        │           ├── service     // Business logic (User service, Party service, etc.)
        │           └── MeetRidersApplication.java // Main application entry point
        │
        └── resources
            ├── application.properties  // Main application configuration
            └── static                  // Static assets (if any)
```

## API Documentation (Prototype)

The API is the interface between the frontend and the backend. All endpoints are prefixed with `/api`.

### Authentication

`POST /api/auth/register`
*   Registers a new user. Requires email, password, and name. Sends a verification email.

`POST /api/auth/login`
*   Authenticates a user with email and password. Returns a JWT token if successful.

`GET /api/auth/verify?token={verificationToken}`
*   Verifies a user's email using the token sent during registration.

### Users

`GET /api/users/me`
*   **Requires Auth.** Fetches the profile of the currently logged-in user.

`PUT /api/users/me`
*   **Requires Auth.** Updates the profile of the currently logged-in user (e.g., bio, photo).

`GET /api/users/{userId}`
*   **Requires Auth.** Fetches the public profile of a specific user, including their ratings.

### Parties

`POST /api/parties`
*   **Requires Auth.** Creates a new travel party.
*   **Body:** `{ "destination": "...", "origin": "...", "transportMode": "CAR", "departureTime": "...", "maxMembers": 4 }`

`GET /api/parties`
*   **Requires Auth.** Retrieves a list of active parties. Can be filtered using query parameters.
*   **Query Params:** `?destination=...`, `?transportMode=...`

`GET /api/parties/{partyId}`
*   **Requires Auth.** Gets detailed information about a single party, including its members.

`POST /api/parties/{partyId}/join`
*   **Requires Auth.** Sends a request to join a specific party.

`POST /api/parties/{partyId}/requests/{requestId}`
*   **Requires Auth (Host only).** Accepts or denies a join request.
*   **Body:** `{ "action": "ACCEPT" }` or `{ "action": "DECLINE" }`

### WebSocket Endpoints

Real-time features are handled via WebSocket connections after an initial HTTP handshake.

`/ws/chat/{partyId}`
*   Establishes a WebSocket connection for the in-app group chat for a given party. Clients can send and receive messages on this topic.

`/ws/tracking/{partyId}`
*   Establishes a WebSocket connection for real-time location sharing for a given party. The host pushes location data, and members receive it.

## Getting Started

Follow these instructions to get the backend server up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Java Development Kit (JDK)**: Version 11 or later.
*   **Gradle**: Version 7 or later.
*   **PostgreSQL**: A running instance of PostgreSQL. Alternatively, you can configure the project to use an in-memory database like H2 for simple testing.

### Configuration

1.  **Database Setup**: Create a new database in your PostgreSQL instance for this project.
    ```sql
    CREATE DATABASE meet_riders_db;
    ```
2.  **Application Properties**: The backend is configured via the `application.properties` file located in `src/main/resources`.
    Create a copy of `application.properties.example` and name it `application.properties`.

    **`application.properties.example`**
    ```properties
    # Database Configuration
    spring.datasource.url=jdbc:postgresql://localhost:5432/meet_riders_db
    spring.datasource.username=your_db_user
    spring.datasource.password=your_db_password
    spring.jpa.hibernate.ddl-auto=update # Use 'create' for the first run, 'update' or 'validate' later
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

    # JWT Secret Key - USE A STRONG, RANDOMLY GENERATED KEY
    jwt.secret=YourSuperSecretKeyForJWTsThatIsLongAndSecure

    # Server Port
    server.port=8080
    ```
3.  Fill in the `spring.datasource` credentials and set a strong, unique `jwt.secret`.

### Running the Server

1.  Open a terminal and navigate to the `backend` root directory.
2.  Ensure your PostgreSQL server is running.
3.  Run the application using the Gradle wrapper:

    *   On macOS/Linux:
        ```bash
        ./gradlew bootRun
        ```
    *   On Windows:
        ```bash
        gradlew.bat bootRun
        ```
4.  The server will start on the port defined in `application.properties` (default is `8080`). You will see logs indicating that the Spring application has started successfully.