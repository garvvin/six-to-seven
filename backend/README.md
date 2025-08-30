# Flask Backend with Supabase Integration

A Flask backend server with user authentication, JWT tokens, and Supabase database integration.

## Features

- User registration and authentication
- JWT token-based sessions
- Supabase database integration
- Password hashing with salt
- CORS support for frontend integration
- Modular structure with separate routes, services, and models

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Flask Configuration
SECRET_KEY=your-actual-secret-key-here
JWT_SECRET_KEY=your-actual-jwt-secret-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-actual-supabase-anon-key

# OpenAI Configuration (for future use)
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Supabase Database Setup

Create a `users` table in your Supabase database with the following SQL:

```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your use case)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);
```

### 4. Run the Server

```bash
python run.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Health Check

- `GET /api/health` - Server health status

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "username"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile (with JWT token)

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   │   └── auth.py         # Authentication routes
│   ├── services/            # Business logic
│   │   └── supabase_service.py  # Supabase integration
│   └── utils/               # Utility functions
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
└── README.md               # This file
```

## Security Features

- Password hashing with salt using SHA-256
- JWT token authentication
- CORS configuration for frontend security
- Input validation and sanitization
- Environment variable configuration

## Development

- The server runs in debug mode by default
- JWT tokens don't expire in development (set `JWT_ACCESS_TOKEN_EXPIRES` in production)
- CORS is configured for localhost development

## Production Considerations

- Set `debug=False` in production
- Use strong, unique secret keys
- Configure proper JWT token expiration
- Set up proper CORS origins
- Use HTTPS in production
- Consider rate limiting
- Add logging and monitoring
