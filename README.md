# HackAtSST Attendance System

A modern attendance tracking system built with Next.js and Firebase, designed to help teachers and administrators manage student attendance efficiently.

## Features

- Admin/Teacher Authentication
- Class Management
  - Create and manage classes
  - Add/remove students
  - Post class announcements
  - Schedule events and track attendance

- Student Features
  - Join classes
  - View announcements
  - Track personal attendance history
  - View upcoming events

- Real-time Updates
  - Attendance status updates
  - Class announcements
  - Event scheduling

## Tech Stack

- Next.js
- Firebase Admin SDK
- Firestore Database
- Firebase Authentication

## Project Structure

The project uses API routes for server-side operations:
- `/api/addAdminClasses` - Add new classes for admins
- `/api/addAnnouncement` - Post class announcements
- `/api/addEvent` - Schedule new events
- `/api/addStudent` - Add students to classes
- `/api/checkAdmin` - Verify admin privileges
- `/api/formChangeStatus` - Update attendance status
- `/api/getAdminClasses` - Fetch admin's classes
- `/api/getClassAnnouncements` - Retrieve class announcements
- `/api/getClassEvents` - Get scheduled events
- `/api/getClassStudents` - List students in a class
- `/api/getStudentAttendance` - View student attendance records

## Setup

1. Clone the repository
2. Install dependencies
3. Configure Firebase credentials
4. Run the development server

## Environment Variables

Required Firebase configuration:
- FIREBASE_SERVICE_ACCOUNT_KEY
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
