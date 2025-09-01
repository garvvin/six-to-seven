# Chat Route Documentation

## Overview

The chat route provides AI-powered health chat functionality that allows users to ask questions about their health based on their analyzed medical documents.

## Features

- **Health Chat**: AI-powered responses based on user's medical documents
- **Context-Aware**: Includes health context from previously analyzed documents
- **Secure**: JWT authentication required for all endpoints
- **Chat History**: Track and manage chat conversations

## Endpoints

### 1. Health Chat

**POST** `/api/chat/health-chat`

Generate AI responses to health-related questions using the user's medical document context.

**Request Body:**

```json
{
  "message": "What can you tell me about my blood pressure?",
  "include_health_context": true
}
```

**Response:**

```json
{
  "success": true,
  "response": "Based on your medical documents, I can see that...",
  "message": "Chat response generated successfully",
  "health_context_included": true
}
```

**Parameters:**

- `message` (required): User's question or message
- `include_health_context` (optional): Whether to include health context from documents (default: true)

### 2. Get Chat History

**GET** `/api/chat/chat-history`

Retrieve chat history for the authenticated user.

**Query Parameters:**

- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**

```json
{
  "success": true,
  "messages": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

### 3. Clear Chat History

**DELETE** `/api/chat/clear-chat-history`

Clear all chat history for the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

## Authentication

All chat endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Health Context Integration

The chat system automatically integrates with the user's health insights by:

1. Fetching user's analyzed medical documents from Supabase
2. Formatting the data into a context summary
3. Including this context in AI prompts for personalized responses

## Dependencies

- `openai`: For AI chat completions
- `flask-jwt-extended`: For JWT authentication
- `supabase`: For retrieving user health data

## Environment Variables

Required environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Usage Example

### Frontend Integration

```javascript
// Send a health chat message
const response = await fetch("/api/chat/health-chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: "What should I know about my recent blood work?",
    include_health_context: true,
  }),
});

const data = await response.json();
console.log(data.response); // AI-generated health advice
```

### Backend Testing

Run the test script to verify endpoints:

```bash
cd backend
python test_chat_route.py
```

## Security Considerations

- All endpoints require JWT authentication
- User data is isolated by user ID
- Health context is only accessible to the authenticated user
- OpenAI API calls are made server-side to protect API keys

## Error Handling

The chat system gracefully handles errors:

- Missing or invalid authentication tokens
- OpenAI API failures
- Supabase connection issues
- Invalid request data

All errors return appropriate HTTP status codes and error messages.

## Future Enhancements

- Persistent chat history storage
- Message threading and conversations
- File attachment support
- Multi-language support
- Chat analytics and insights
