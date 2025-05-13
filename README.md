# Taskin

A full-stack mobile task management application built with React Native, Expo, and Node.js.

## Overview

Taskin is a comprehensive task management solution designed to help users organize their daily activities, set priorities, and track progress. The application features a clean, intuitive interface built with React Native for the frontend and a robust Node.js backend API to handle data persistence and business logic.

## Features

- **Task Management**: Create, edit, delete, and organize tasks
- **Priority Levels**: Set importance and urgency for better organization
- **Categories/Tags**: Group related tasks together
- **Due Dates & Reminders**: Never miss important deadlines
- **Progress Tracking**: Visualize task completion rates
- **Cross-platform**: Works seamlessly on iOS and Android devices

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- AsyncStorage (local data persistence)
- Axios (API communication)

### Backend
- Node.js
- Express.js
- MongoDB/PostgreSQL (database)
- JWT Authentication
- RESTful API design

## Project Structure

```
taskin/
├── frontend/            # React Native Expo app
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── navigation/      # App navigation configuration
│   ├── screens/         # App screens
│   ├── services/        # API integration services
│   ├── store/           # State management
│   ├── utils/           # Helper functions
│   └── App.js           # Main app entry point
│
├── backend/             # Node.js server
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Server entry point
│
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── eas.json             # EAS Build configuration
└── app.config.js        # Expo configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- MongoDB or PostgreSQL (for backend)

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
expo start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

### Backend Deployment
The backend is deployed to a cloud hosting service (e.g., Heroku, AWS, DigitalOcean).

### Mobile App Deployment
The application is built and deployed using Expo Application Services (EAS).

```bash
# Build for different environments
eas build --profile development --platform all  # Development build
eas build --profile preview --platform all      # Testing build
eas build --profile production --platform all   # Production build

# Submit to app stores
eas submit -p ios     # Submit to Apple App Store
eas submit -p android # Submit to Google Play Store
```

## Environment Variables

### Frontend
Create `.env` files according to your environment:
```
API_URL=https://your-api-url.com
API_KEY=your_api_key
```

### Backend
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## License

[MIT License](LICENSE)

## Contact

For any inquiries or suggestions, please open an issue on this repository.

---

© 2025 Taskin. All rights reserved.
