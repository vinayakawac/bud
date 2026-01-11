# API Documentation

## Base URL

```
Production: https://your-api-domain.com/api
Development: http://localhost:5000/api
```

## Authentication

Admin routes require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## Public Endpoints

### GET /projects

Get all public projects with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `tech` (optional): Filter by technology
- `year` (optional): Filter by year

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Markdown description",
      "techStack": ["React", "Node.js"],
      "category": "Web Application",
      "previewImages": ["url1", "url2"],
      "externalLink": "https://github.com/user/repo",
      "metadata": { "version": "1.0.0", "year": 2024 },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 10
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### GET /projects/:id

Get single project by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Project Title",
    "description": "Full markdown description...",
    "techStack": ["React", "Node.js", "PostgreSQL"],
    "category": "Web Application",
    "previewImages": ["url1", "url2"],
    "externalLink": "https://github.com/user/repo",
    "metadata": { "version": "1.0.0" },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Project not found
- `500`: Server error

---

### POST /ratings

Submit a rating (rate-limited: 1 per day per IP).

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Optional feedback text"
}
```

**Validation:**
- `rating`: Integer 1-5 (required)
- `feedback`: String max 1000 chars (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rating": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Validation error
- `429`: Rate limit exceeded (already rated today)
- `500`: Server error

---

### GET /contact

Get contact information.

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "contact@example.com",
    "phone": "+1234567890",
    "socialLinks": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "twitter": "https://twitter.com/username"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### POST /contact

Send a contact message (rate-limited).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here (min 10 chars)"
}
```

**Validation:**
- `name`: String 1-100 chars (required)
- `email`: Valid email (required)
- `message`: String 10-2000 chars (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Validation error
- `429`: Rate limit exceeded
- `500`: Server error

---

## Admin Endpoints

### POST /admin/login

Admin authentication.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid credentials
- `429`: Too many attempts
- `500`: Server error

---

### POST /admin/projects

Create new project (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Markdown description",
  "techStack": ["React", "Node.js"],
  "category": "Web Application",
  "previewImages": ["https://example.com/image.jpg"],
  "externalLink": "https://github.com/user/repo",
  "isPublic": true,
  "metadata": { "version": "1.0.0", "year": 2024 }
}
```

**Validation:**
- `title`: String 1-200 chars (required)
- `description`: String min 1 char (required)
- `techStack`: Array min 1 item (required)
- `category`: String min 1 char (required)
- `previewImages`: Array of URLs (optional)
- `externalLink`: Valid URL (required)
- `isPublic`: Boolean (optional, default: true)
- `metadata`: Object (optional)

**Response:**
```json
{
  "success": true,
  "data": { /* full project object */ }
}
```

**Status Codes:**
- `201`: Created
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

### PUT /admin/projects/:id

Update existing project (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
Same as POST but all fields optional.

**Response:**
```json
{
  "success": true,
  "data": { /* updated project object */ }
}
```

**Status Codes:**
- `200`: Success
- `400`: Validation error
- `401`: Unauthorized
- `404`: Project not found
- `500`: Server error

---

### DELETE /admin/projects/:id

Delete project (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Project not found
- `500`: Server error

---

### GET /admin/ratings

Get all ratings with statistics (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "feedback": "Great platform!",
      "ipHash": "hashed_ip",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "stats": {
    "total": 100,
    "average": 4.5,
    "distribution": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 30,
      "5": 40
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### DELETE /admin/ratings/:id

Delete rating (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Rating deleted successfully"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Rating not found
- `500`: Server error

---

### PUT /admin/contact

Update contact information (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "phone": "+1234567890",
  "socialLinks": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username"
  }
}
```

**Validation:**
- `email`: Valid email (optional)
- `phone`: String max 20 chars (optional)
- `socialLinks`: Object with URL values (optional)

**Response:**
```json
{
  "success": true,
  "data": { /* updated contact info */ }
}
```

**Status Codes:**
- `200`: Success
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

### GET /admin/analytics

Get platform analytics (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 50,
      "public": 45,
      "recent": 5
    },
    "ratings": {
      "total": 100,
      "average": 4.5,
      "recent": 15
    },
    "messages": {
      "total": 25
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

## Rate Limiting

All public endpoints are rate-limited:

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Strict Endpoints** (ratings, contact): 5 requests per 15 minutes
- **Auth Endpoint**: 5 attempts per 15 minutes

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes:**
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

---

## CORS

CORS is configured to allow requests from the frontend origin only.

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Your configured domain

**Allowed Methods:**
- GET, POST, PUT, DELETE

**Allowed Headers:**
- Content-Type, Authorization

---

## Testing with cURL

### Get Projects
```bash
curl https://api.example.com/api/projects
```

### Submit Rating
```bash
curl -X POST https://api.example.com/api/ratings \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "feedback": "Great!"}'
```

### Admin Login
```bash
curl -X POST https://api.example.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### Create Project (Admin)
```bash
curl -X POST https://api.example.com/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Project",
    "description": "Description",
    "techStack": ["React"],
    "category": "Web",
    "externalLink": "https://github.com/user/repo"
  }'
```

---

## Postman Collection

Import this collection for easy testing:

1. Create new collection
2. Set base URL variable: `{{baseUrl}}`
3. Add endpoints from this documentation
4. For admin routes, set Authorization header with token

---

## Webhooks (Future Enhancement)

Not currently implemented, but planned for:
- New project notifications
- Rating alerts
- Contact form submissions
