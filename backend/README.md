# College Carpool App Backend

## Overview
Backend server for a carpooling application designed specifically for college students to find and share rides with their peers. This system handles user management, ride coordination, and real-time communications for the carpool platform.

## Features

### User Management
- Student information storage and validation:
  - Full Name
  - College ID
  - Branch/Department
  - Year of Study
  - Gender
  - Contact Number
  - Email Address (with college email verification)
  - Profile Picture storage
  - Authentication and Authorization

### Ride Management System
- Ride data handling:
  - Creation and management of ride offers
  - Location coordinates storage
  - Time scheduling
  - Seat availability tracking
  - Cost calculation
  - Vehicle information storage
  - Gender preference filtering

### Real-time Services
- WebSocket implementation for:
  - Live chat functionality
  - Instant ride notifications
  - Location tracking updates
  - Status change broadcasts

### Security Features
- Email verification system
- Password encryption
- JWT token authentication
- Ride history logging
- User rating system
- Report management
- Emergency contact system

### Database Schema
- Users Table
  - user_id (Primary Key)
  - full_name
  - college_id
  - department
  - year_of_study
  - gender
  - contact_number
  - email
  - profile_picture_url
  - rating
  
- Rides Table
  - ride_id (Primary Key)
  - driver_id (Foreign Key)
  - departure_location
  - destination
  - departure_time
  - available_seats
  - cost_per_seat
  - gender_preference
  - vehicle_details
  - status

- Messages Table
  - message_id (Primary Key)
  - sender_id (Foreign Key)
  - receiver_id (Foreign Key)
  - ride_id (Foreign Key)
  - content
  - timestamp
  - status

## Technical Requirements
- Java Spring Boot backend
- PostgreSQL database
- WebSocket for real-time communication
- JWT authentication
- Email service integration
- Location services integration
- File storage for profile pictures

## API Endpoints

### User Management
- POST /api/auth/register
- POST /api/auth/login
- GET /api/user/profile
- PUT /api/user/profile
- POST /api/user/verify-email

### Ride Management
- POST /api/rides/create
- GET /api/rides/search
- GET /api/rides/{id}
- PUT /api/rides/{id}/join
- PUT /api/rides/{id}/cancel
- GET /api/rides/history

### Messaging
- GET /api/messages/{ride_id}
- POST /api/messages/send
- PUT /api/messages/read

## Setup Instructions
1. Install Java 17 or higher
2. Configure PostgreSQL database
3. Update application.properties with database credentials
4. Run using Gradle:
   ```bash
   ./gradlew bootRun
   ```

## Security Considerations
- Input validation
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration
- Secure password storage
- Session management

## Future Enhancements
- AI-based ride matching
- Payment gateway integration
- Route optimization algorithms
- Advanced analytics dashboard
- Mobile push notifications
- Emergency SOS system
