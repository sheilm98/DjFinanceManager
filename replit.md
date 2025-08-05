# GigPro - DJ Gig Management App

## Overview
GigPro is a React Native Expo application designed for DJs to manage their gigs, clients, invoices, and finances. The app provides a comprehensive mobile-first solution for the business side of being a DJ.

## Recent Changes
- **2025-01-15**: Refactored from fullstack web app to React Native Expo app
- Mobile-first design with native iOS/Android support
- Maintained all core functionality: gig management, invoicing, client management
- Added native mobile features like camera integration for logo uploads

## Architecture
- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query for server state, React Context for app state
- **UI Library**: React Native Elements + Custom components
- **Database**: SQLite with Expo SQLite for local storage
- **Authentication**: Expo SecureStore for token management
- **File Upload**: Expo ImagePicker and DocumentPicker

## Core Features
1. **Authentication** - Login/Register with secure token storage
2. **Dashboard** - Overview of upcoming gigs, recent invoices, and key metrics
3. **Gig Management** - Create, edit, and track DJ performances
4. **Client Management** - Maintain client database with contact information
5. **Invoice Management** - Generate professional invoices with logo support
6. **Calendar View** - Visual calendar for gig scheduling
7. **Profile Settings** - User profile with logo upload capability

## User Preferences
- Mobile-first design approach
- Native feel with platform-specific UI patterns
- Offline-first data storage with sync capabilities
- Professional invoice templates with branding

## Technical Decisions
- Using Expo managed workflow for easier development and deployment
- SQLite for local data persistence
- React Query for efficient data fetching and caching
- Modular component architecture for reusability
- TypeScript for type safety

## Project Structure
```
/
├── app/                 # Expo Router pages
├── components/          # Reusable React Native components
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── assets/             # Images, fonts, etc.
└── package.json        # Dependencies and scripts
```