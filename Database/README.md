# Dashboard Storage System

## Overview

The dashboard storage system has been migrated from localStorage to a PostgreSQL database to provide persistent, user-specific dashboard configurations.

## Database Schema

### Dashboard Table

- `id`: Primary key (Integer)
- `user_id`: Foreign key to User table (Integer)
- `panels`: JSON string containing panel configurations (Text)
- `created_at`: Timestamp when dashboard was created (DateTime)
- `updated_at`: Timestamp when dashboard was last updated (DateTime)

## API Endpoints

### GET /app/dashboard

Retrieves the current user's dashboard configuration.

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "panels": [
    {
      "id": "panel-1",
      "title": "Memory Usage",
      "src": "...",
      "layout": { "x": 0, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3 }
    }
  ]
}
```

### POST /app/dashboard

Saves the current user's dashboard configuration.

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**

```json
{
  "panels": [
    {
      "id": "panel-1",
      "title": "Memory Usage",
      "src": "...",
      "layout": { "x": 0, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3 }
    }
  ]
}
```

## Frontend Changes

### useGrafanaDashboard Hook

The hook now:

- Makes API calls to save/load dashboard configurations
- Includes loading states for better UX
- Falls back to localStorage if API calls fail
- Requires authentication token from localStorage

### Metrics Component

- Shows loading state during save operations
- Disables save button while saving
- Displays "Saving..." text during save operation

## Setup Instructions

1. **Database Migration:**

   ```bash
   cd Database
   python migrate.py
   ```

2. **Backend Setup:**

   - The backend will automatically create the dashboard table on startup
   - Ensure PostgreSQL is running and accessible

3. **Frontend Setup:**
   - No additional setup required
   - The hook will automatically use the new API endpoints

## Features

- **User-specific dashboards**: Each user has their own dashboard configuration
- **Persistent storage**: Dashboard configurations survive browser restarts and device changes
- **Fallback support**: Falls back to localStorage if API is unavailable
- **Loading states**: Better user experience with loading indicators
- **Error handling**: Graceful error handling with console logging

## Security

- All dashboard operations require valid JWT authentication
- Dashboard configurations are tied to specific user IDs
- No cross-user data access possible
