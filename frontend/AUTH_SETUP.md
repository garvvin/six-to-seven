# Authentication System Setup

This document explains how to set up and use the authentication system that connects to your Supabase backend.

## Prerequisites

1. **Backend Server Running**: Make sure your Flask backend is running on `http://localhost:5000`
2. **Supabase Database**: Ensure your Supabase database has a `users` table with the required fields
3. **Environment Variables**: Set up the backend environment variables (see backend README)

## Frontend Dependencies

The following packages have been installed:

- `axios`: For HTTP requests to the backend
- `js-cookie`: For JWT token storage in cookies
- `zod`: For form validation (already installed)

## Environment Configuration

Create a `.env` file in the frontend directory:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

## Database Schema

Your Supabase `users` table should have these fields:

- `id`: Primary key (auto-generated)
- `username`: String, unique
- `email`: String, unique
- `password_hash`: String (hashed password)
- `created_at`: Timestamp (auto-generated)

## Features

### 1. User Registration

- **Endpoint**: `POST /auth/register`
- **Fields**: username, email, password, confirmPassword
- **Validation**:
  - Username: minimum 3 characters
  - Email: valid email format
  - Password: minimum 8 characters
  - Confirm password: must match password

### 2. User Login

- **Endpoint**: `POST /auth/login`
- **Fields**: email, password
- **Validation**:
  - Email: valid email format
  - Password: minimum 6 characters

### 3. Authentication State Management

- JWT tokens stored in cookies (7-day expiration)
- Automatic token refresh on page load
- Protected routes (redirect to login if not authenticated)
- User state available throughout the app

### 4. User Interface

- **Header**: Shows login/signup buttons when not authenticated
- **Header**: Shows username and logout button when authenticated
- **Forms**: Real-time validation with error messages
- **Responsive**: Works on both desktop and mobile

## Usage

### Using the Auth Context

```jsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.username}!</div>;
  }

  return <div>Please log in</div>;
};
```

### Protected Routes

The authentication system automatically handles:

- Redirecting authenticated users away from login/signup pages
- Redirecting unauthenticated users to login page
- Token expiration handling

### API Calls

All authenticated API calls automatically include the JWT token:

```jsx
import AuthService from '../services/authService';

// Get user profile
const profile = await AuthService.getProfile();

// Update user profile
await AuthService.updateProfile({ username: 'newUsername' });
```

## Security Features

1. **Password Hashing**: Backend uses SHA-256 with salt
2. **JWT Tokens**: Secure token-based authentication
3. **HTTPS Ready**: Configure for production with HTTPS
4. **Token Expiration**: Automatic logout on token expiration
5. **Input Validation**: Client and server-side validation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend has CORS enabled
2. **Connection Refused**: Check if backend is running on correct port
3. **Token Issues**: Clear browser cookies and try again
4. **Validation Errors**: Check form field requirements

### Backend Connection

To test the connection:

1. Start your Flask backend: `python run.py`
2. Start the frontend: `npm run dev`
3. Try to register a new user
4. Check browser console for any errors

## Production Deployment

1. **Environment Variables**: Set `VITE_API_BASE_URL` to your production backend URL
2. **HTTPS**: Use HTTPS in production for security
3. **Domain**: Update CORS settings in backend for production domain
4. **Cookies**: Consider using secure and httpOnly cookies in production

## API Endpoints Reference

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Check session validity
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

All endpoints return JSON responses with appropriate HTTP status codes.
