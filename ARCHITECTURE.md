# 🏗️ TaskFlow Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Login/Register Components                                │
│  - Dashboard with Project List                              │
│  - Kanban Board (3 columns)                                 │
│  - Task Management Interface                                │
│  - Dark Mode Toggle                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
                       │ (Socket.io)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                    │
│                                                              │
│  Routes:                                                    │
│  - /api/auth (login, register, profile)                    │
│  - /api/projects (CRUD operations)                         │
│  - /api/tasks (CRUD + comments)                            │
│                                                              │
│  Middleware:                                                │
│  - JWT Authentication                                      │
│  - CORS                                                    │
│  - Error Handling                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Protocol
                       │
┌──────────────────────▼──────────────────────────────────────┐
│            Database (MongoDB Atlas / Local)                 │
│                                                              │
│  Collections:                                               │
│  - users (authentication & profiles)                       │
│  - projects (team projects)                                │
│  - tasks (kanban tasks)                                    │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User Input (Register/Login)
         ↓
Frontend Validation
         ↓
POST /api/auth/register or /api/auth/login
         ↓
Backend Validation
         ↓
Password Hashing (bcryptjs)
         ↓
User Saved to Database
         ↓
JWT Token Generated
         ↓
Token Stored in localStorage
         ↓
User Logged In ✓
```

### 2. Project Management Flow
```
User Creates Project
         ↓
POST /api/projects
         ↓
Backend Validates Input
         ↓
Project Saved to MongoDB
         ↓
Socket.io Emits Update
         ↓
Frontend Updates Project List
         ↓
User See New Project ✓
```

### 3. Task Management Flow
```
User Creates Task
         ↓
POST /api/tasks
         ↓
Task Validation (title, project)
         ↓
Task Saved to MongoDB
         ↓
Activity Log Created
         ↓
Socket.io Broadcasts Update
         ↓
Frontend Adds to Kanban
         ↓
Task Visible in Column ✓
```

### 4. Drag & Drop Flow
```
User Drags Task
         ↓
onDragStart Stores Task
         ↓
onDragOver Allows Drop
         ↓
onDrop Triggers Update
         ↓
PUT /api/tasks/:id (status update)
         ↓
Backend Updates Task Status
         ↓
Activity Logged
         ↓
Socket.io Notifies Others
         ↓
All Users See Update ✓
```

## Component Structure

### Frontend Components

```
<App>
  ├── <LoginPage>
  │   ├── Register Form
  │   └── Login Form
  │
  └── <Dashboard>
      ├── <Navbar>
      │   ├── Logo
      │   ├── Dark Mode Toggle
      │   └── User Dropdown
      │
      ├── <Sidebar (ProjectList)>
      │   ├── New Project Button
      │   ├── Project Creation Form
      │   └── Project Items
      │
      └── <MainContent (KanbanBoard)>
          ├── Board Header
          ├── New Task Form
          └── <KanbanColumn> x 3
              └── <TaskCard> (draggable)
                  ├── Title & Description
                  ├── Priority Badge
                  ├── Due Date
                  ├── Assignee Avatar
                  └── Delete Button
```

### Backend Services

```
Server (Express)
  ├── Authentication Services
  │   ├── User Registration
  │   ├── User Login
  │   ├── JWT Verification
  │   └── Password Hashing
  │
  ├── Project Services
  │   ├── Create Project
  │   ├── Read Projects
  │   ├── Update Project
  │   ├── Delete Project
  │   ├── Add Members
  │   └── Remove Members
  │
  ├── Task Services
  │   ├── Create Task
  │   ├── Read Tasks
  │   ├── Update Task Status
  │   ├── Delete Task
  │   ├── Add Comments
  │   └── Log Activity
  │
  └── Real-time Services (Socket.io)
      ├── Join Project Room
      ├── Broadcast Task Created
      ├── Broadcast Task Updated
      ├── Broadcast Task Deleted
      └── Broadcast Status Changed
```

## Database Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (indexed, unique),
  password: String (hashed),
  role: String (user/admin),
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** email (unique), createdAt

### Projects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [{
    user: ObjectId (ref: User),
    role: String (owner/member)
  }],
  color: String,
  status: String (active/archived),
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** owner, members.user, status

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String (todo/progress/done),
  priority: String (low/medium/high/critical),
  dueDate: Date,
  assignee: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  creator: ObjectId (ref: User),
  attachments: [String],
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  activityLog: [{
    action: String,
    changedBy: ObjectId (ref: User),
    timestamp: Date,
    details: Mixed
  }],
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** project, status, assignee, creator, dueDate

## API Request/Response Cycle

### Example: Create Task Request

```
Client:
POST /api/tasks
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockup",
  "priority": "high",
  "dueDate": "2026-04-05",
  "projectId": "507f1f77bcf86cd799439011"
}

↓ (Network)

Server:
1. Verify JWT Token (auth middleware)
2. Validate Input (title, projectId required)
3. Check User Access (project owner/member)
4. Hash sensitive data if needed
5. Save to MongoDB
6. Populate References (creator, assignee)
7. Log Activity

Response:
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "507f191e810c19729de860ea",
    "title": "Design homepage",
    "description": "Create mockup",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-04-05T00:00:00Z",
    "project": "507f1f77bcf86cd799439011",
    "creator": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "profileImage": "..."
    },
    "createdAt": "2026-03-31T10:30:00Z",
    "updatedAt": "2026-03-31T10:30:00Z"
  }
}

↓ (Network)

Client:
1. Parse Response
2. Add Task to State (tasks array)
3. Update UI (add to todo column)
4. Emit Socket.io Event ("task-created")
5. Show Success Message
```

## Real-time Updates with Socket.io

### Event Flow

```
Client 1 (User A)                Client 2 (User B)
    │                                 │
    └─ Joins Project Room ───────────┘
         socket.emit("join-project", projectId)
    
    │                                 │
    └─ Moves Task (drag-drop) ───────┘
         Task Status: todo → progress
         PUT /api/tasks/:id
         socket.emit("task-status-changed", {...})
    
    │◄─────── Socket receives ────────┤
    ├─── UI Updates automatically ───►│
    │      (no page refresh)           │
    
Result: Both users see the change instantly!
```

## Security Layers

### 1. Frontend Security
- Login validation before API calls
- Token stored in localStorage
- Token attached to all API requests
- Input validation before submission
- XSS protection (React escapes by default)

### 2. Backend Security
- JWT Verification Middleware
- Input Sanitization
- Password Hashing (bcryptjs)
- Access Control (owner, member checks)
- CORS Configuration
- Error Handling (no sensitive data exposed)

### 3. Database Security
- Indexed queries for performance
- No passwords returned in queries
- Activity logging for audit trail
- Soft deletes possible with status field

## Performance Optimization

### Frontend
- React CDN (minified)
- Bootstrap CDN (cached globally)
- CSS minified
- Lazy loading for images
- Socket.io for real-time (instead of polling)

### Backend
- Database Indexes on frequently queried fields
- Connection pooling with MongoDB
- JWT caching
- Pagination support (ready to implement)
- Response compression

### Database
- Schema optimization
- Strategic indexes
- Denormalization where needed (embedded docs)
- Query optimization

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (can run multiple instances)
- Session stored in localStorage (not server)
- JWT for distributed auth
- Socket.io adapter for multiple servers

### Vertical Scaling
- Database indexes for query optimization
- Connection pooling
- Caching strategy (Redis ready)

### Future Improvements
1. **Pagination** - Limit results per page
2. **Caching** - Redis for frequently accessed data
3. **Queues** - Bull for background jobs
4. **CDN** - CloudFront for static assets
5. **Load Balancing** - Nginx for multiple servers
6. **Monitoring** - Sentry for error tracking
7. **Analytics** - Mixpanel for user insights

## Testing Strategy

### Frontend Testing
- Component rendering
- Form validation
- API integration
- Socket.io events
- Dark mode toggle

### Backend Testing
- API endpoints
- Authentication flow
- Database operations
- Error handling
- Input validation

### Integration Testing
- Full user workflows
- Multi-user scenarios
- Real-time updates
- Task transitions

## Deployment Checklist

### Pre-deployment
- [ ] Env variables configured
- [ ] Database backup
- [ ] SSL certificate ready
- [ ] Tokens secured
- [ ] CORS properly configured

### Deployment
- [ ] Backend deployed (Heroku, Railway, AWS)
- [ ] MongoDB Atlas configured
- [ ] Frontend deployed (Vercel, Netlify)
- [ ] Domain configured
- [ ] SSL enabled

### Post-deployment
- [ ] Health checks passing
- [ ] Logs monitored
- [ ] Error tracking enabled
- [ ] Performance metrics tracked
- [ ] Backup automated

## Contribution Guidelines

When extending this project:

1. **Follow the structure** - Keep models, routes, components organized
2. **Write comments** - Explain complex logic
3. **Validate input** - Both frontend and backend
4. **Handle errors** - Gracefully with user feedback
5. **Test thoroughly** - Manual and automated
6. **Update docs** - Keep README and API docs current

## Conclusion

TaskFlow is built with modern best practices, scalability in mind, and a focus on user experience. The architecture allows for easy extension and maintenance while providing real-time collaboration features out of the box.
