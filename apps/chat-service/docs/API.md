# Chat Service API Documentation

## Base URL
```
http://api.legal-consultation.com/api/v1
```

## Authentication

All endpoints require Bearer token authentication.

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health Check

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

### Sessions

#### POST /sessions/

Create a new consultation session.

**Request Body:**
```json
{
  "legal_domain": "CIVIL",
  "session_type": "INITIAL"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| legal_domain | string | Yes | Legal domain (CIVIL, CRIMINAL, LAND, LABOR, COMMERCIAL, FAMILY, INTELLECTUAL, TAX, ADMINISTRATIVE, INSURANCE) |
| session_type | string | No | Session type (INITIAL, FOLLOWUP, EMERGENCY). Default: INITIAL |

**Response:**
```json
{
  "session_id": "uuid",
  "status": "CREATED"
}
```

#### GET /sessions/{session_id}

Get session details.

**Response:**
```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "lawyer_id": "uuid or null",
  "legal_domain": "CIVIL",
  "status": "CREATED",
  "session_type": "INITIAL",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Messages

#### POST /sessions/{session_id}/messages/

Send a message to a session.

**Request Body:**
```json
{
  "content": "Hello, I need legal advice",
  "content_type": "TEXT"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Message content |
| content_type | string | No | Content type (TEXT, IMAGE, DOCUMENT, LINK). Default: TEXT |

**Response:**
```json
{
  "message_id": "uuid",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /sessions/{session_id}/messages/

Get messages for a session.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 100 | Maximum messages to return |
| offset | int | 0 | Number of messages to skip |

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_type": "CUSTOMER",
      "sender_id": "uuid",
      "content": "Hello",
      "content_type": "TEXT",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## WebSocket

### Connect

```
ws://api.legal-consultation.com/ws/session/{session_id}?token=<jwt>
```

### Message Types

#### Send Chat Message
```json
{
  "type": "chat_message",
  "content": "Hello",
  "content_type": "TEXT"
}
```

#### Receive Chat Message
```json
{
  "type": "chat_message",
  "message_id": "uuid",
  "sender_type": "CUSTOMER",
  "content": "Hello",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "user_id": "uuid",
  "is_typing": true
}
```

#### Read Receipt
```json
{
  "type": "read_receipt",
  "message_id": "uuid",
  "user_id": "uuid"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Session not found"
}
```

## Kafka Events

### Topics

- `chat.message` - Chat messages
- `consultation.events` - Consultation session events
- `audit.log` - Audit logs

### Event Schemas

Schemas are registered with Schema Registry and available at:
- `chat-message-value`
- `consultation-event-value`
- `audit-event-value`
