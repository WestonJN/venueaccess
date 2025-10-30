# Venue Access Control System - Copilot Instructions

This project is a venue access control system built with Next.js, TypeScript, and Tailwind CSS.

## Project Overview
- **Purpose**: Manage venue access using QR codes
- **Tech Stack**: Next.js 15, TypeScript, React, Tailwind CSS
- **Features**: User management, QR code generation/scanning, access logging, search functionality

## Development Guidelines
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Keep components modular and reusable

## Key Components
- `PersonList`: Manages the list of people and search functionality
- `PersonForm`: Form for adding/editing people
- `PersonCard`: Displays individual person information and QR codes
- `QRScanner`: Handles QR code scanning and manual access

## Data Structure
- People are stored with id, name, email, phone, access status, and QR code
- Access logs track all entry attempts with timestamps
- Data persists in browser localStorage

## Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Production: `npm start`

The application is accessible at http://localhost:3000 when running.
