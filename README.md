# Events Website

This is a React and TypeScript application built with Vite. It uses Firebase for authentication and Supabase for the database to manage events.
Video walk through of app: https://www.youtube.com/shorts/fEyEFpKCaDM
Link to hosted website: https://events-1-jmmq.onrender.com/

## Features

*   User authentication (Sign Up, Sign In, Sign Out) using Firebase.
*   User profile management in Supabase, linked to Firebase UID.
*   Admin roles for creating and managing events.
*   Browse, search, and filter events.
*   Users can sign up to attend events.
*   Admins can create, edit, and delete events.
*   Admins can create Admin Accounts
*   Integration with Google Calendar to add events.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** CSS (with some inline styles)
*   **Routing:** React Router DOM
*   **Authentication:** Firebase Authentication
*   **Database:** Supabase
*   **State Management:** React Context API for auth state
*   **Linting:** ESLint with TypeScript support

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn/pnpm)
*   Firebase project setup with Authentication enabled.
*   Supabase project setup with a `Users` table, an `Events` table and a `Signups` table.

### Setup Environment Variables

Create a `.env` file in the `events-website` directory with the following variables:

```env
VITE_FIREBASE_KEY=your_firebase_api_key
VITE_FIREBASE_SENDERKEY=your_firebase_messaging_sender_id
VITE_FIREBASE_APPID=your_firebase_app_id
VITE_FIREBASEMEASID=your_firebase_measurement_id

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
## Test Accounts Access Details 

### Admin Account

Email: Admin@test.com
Password: Password

### General User Account

Email: test@test.com
Password: Password
