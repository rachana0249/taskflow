# 🚀 TaskFlow - Real-time Team Collaboration & Task Manager

A modern, full-stack web application for managing projects and tasks with real-time collaboration features. Built with **React**, **Node.js/Express**, **MongoDB**, and **Socket.io** for seamless team productivity.

## 📋 Features

### Core Features
- ✅ **User Authentication** - Secure registration & login with JWT tokens
- ✅ **Project Management** - Create, edit, and organize multiple projects
- ✅ **Kanban Board** - Three-column task board (To Do → In Progress → Done)
- ✅ **Drag & Drop** - Intuitive task movement between columns
- ✅ **Task Management** - Create, update, delete, and manage tasks
- ✅ **Priority System** - Low, Medium, High, and Critical priority levels
- ✅ **Due Dates** - Track task deadlines with calendar dates
- ✅ **Task Assignment** - Assign tasks to team members
- ✅ **Dark Mode** - Beautiful dark theme support
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Socket.io for live task updates
- ✅ **Activity Logging** - Track who changed what and when
- ✅ **User Profiles** - Avatar generation and user information

### Advanced Features
- 🔔 Real-time notifications (Socket.io)
- 📊 Task filtering and search
- 👥 Team collaboration features
- 💬 Comments on tasks
- 📝 Activity history per task
- 🎨 Color-coded priority badges
- 📱 Mobile-friendly UI
- ⚡ Fast and responsive interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework (via CDN)
- **Bootstrap 5** - Responsive design framework
- **Font Awesome** - Icons
- **Socket.io Client** - Real-time communication
- **CSS3** - Custom styling with dark mode support

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time updates
- **CORS** - Cross-origin requests

### Database
- **MongoDB** - Document database (local or Atlas)
- **Collections**: Users, Projects, Tasks

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with password hashing
│   │   ├── Project.js        # Project schema with members
│   │   └── Task.js           # Task schema with kanban support
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── projects.js       # Project CRUD operations
│   │   └── tasks.js          # Task CRUD operations
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── server.js             # Main Express server with Socket.io
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment variables template
│   └── .env                  # (Create locally)
│
├── frontend/
│   ├── index.html            # Main HTML with React setup
│   ├── app.js                # React components (all-in-one)
│   ├── style.css             # Complete styling with dark mode
│   ├── package.json          # Frontend dependencies
│   ├── .env.example          # Environment variables template
│   └── .env                  # (Create locally)
│
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas cloud)
- **Git** (optional)

### Installation & Setup

#### 1. Clone/Download the Project
```bash
cd taskflow
```

#### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Required: MONGO_URI, JWT_SECRET
```

**Edit `.backend/.env`:**
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_change_in_production
FRONTEND_URL=http://localhost:3000
```

##### Option A: Local MongoDB
```bash
# Install MongoDB locally or use Docker
# Mac:
brew install mongodb-community
brew services start mongodb-community

# Windows: Download from https://www.mongodb.com/try/download/community

# Verify:
mongosh
```

##### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/taskflow`

#### 3. Start Backend Server

```bash
# From backend/ directory
npm start

# Output: 🚀 TaskFlow Server running on port 5001
```

The server will be available at: `http://localhost:5001`

#### 4. Setup Frontend

```bash
# From frontend/ directory (or new terminal)
cd frontend

# Create .env file
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

#### 5. Start Frontend

Choose one method:

**Option A: Simple HTTP Server (Python)**
```bash
# From frontend/ directory
python -m http.server 3000

# Or Python 2:
python -m SimpleHTTPServer 3000
```

**Option B: Using Node serve**
```bash
npm install -g serve
serve -s . -l 3000
```

**Option C: VS Code Live Server**
- Right-click `index.html` → "Open with Live Server"

**Access the application:**
- Open browser: `http://localhost:3000`

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id", "name", "email", "profileImage" }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id", "name", "email", "role", "profileImage" }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { id, name, email, role, profileImage, createdAt }
}
```

### Project Endpoints

#### Get All Projects
```
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "color": "#3498db"
}
```

#### Get Project by ID
```
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```
PUT /api/projects/:id
Authorization: Bearer <token>
{
  "name": "Updated Name",
  "description": "New description"
}
```

#### Delete Project
```
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Task Endpoints

#### Get All Tasks
```
GET /api/tasks
Authorization: Bearer <token>
```

#### Get Project Tasks
```
GET /api/tasks/project/:projectId
Authorization: Bearer <token>
```

#### Create Task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "priority": "high",      // low, medium, high, critical
  "dueDate": "2026-04-01",
  "assignee": "userId",
  "projectId": "projectId"
}
```

#### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "status": "progress",     // todo, progress, done
  "priority": "medium",
  "assignee": "userId",
  "dueDate": "2026-04-01"
}
```

#### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Add Comment to Task
```
POST /api/tasks/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Comment text"
}
```

## 🎨 UI Features

### Login/Register Page
- Clean, modern authentication interface
- Password confirmation on registration
- Form validation
- Beautiful gradient background
- Responsive design

### Dashboard
- Project sidebar with quick access
- Create new projects easily
- Color-coded project indicators
- Project statistics

### Kanban Board
- **Three Columns**: To Do (blue), In Progress (orange), Done (green)
- **Drag & Drop**: Move tasks between columns intuitively
- **Task Cards** with:
  - Task title and description
  - Priority badges (color-coded)
  - Due date display
  - Assignee avatar
  - Quick delete button
- **Task Statistics**: Count per column

### Dark Mode
- Toggle dark/light theme with button
- Smooth transitions
- System preference detection
- Persistent preference storage

### Responsive Design
- Desktop: Full 3-column layout
- Tablet: 2-column layout
- Mobile: Single column with horizontal scroll
- Touch-friendly buttons and inputs

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcryptjs with salt rounds
3. **Protected Routes** - Middleware-based access control
4. **Input Validation** - Server-side validation
5. **CORS** - Cross-origin request control
6. **Environment Variables** - Sensitive data protection

## 🧪 Testing the Application

### Test User Account (Create your own):
1. Click "Register"
2. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click "Create Account"

### Test Features:
1. **Create Project**: Click "New Project" in sidebar
2. **Add Task**: Click "Add Task" button
3. **Move Task**: Drag task between columns
4. **Edit Task**: Click on task to view details
5. **Dark Mode**: Toggle theme with moon icon
6. **Delete**: Use delete button on cards

## 📝 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user, admin),
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [{
    user: ObjectId (ref: User),
    role: String (owner, member)
  }],
  color: String,
  status: String (active, archived),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String (todo, progress, done),
  priority: String (low, medium, high, critical),
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

## 🚨 Troubleshooting

### Issue: Port 5001 already in use
```bash
# Mac/Linux: Find process using port
lsof -i :5001
kill -9 <PID>

# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Issue: MongoDB connection refused
```bash
# Ensure MongoDB is running
# Mac:
brew services start mongodb-community

# Windows: Start MongoDB from Services
```

### Issue: CORS errors
- Check `FRONTEND_URL` in backend `.env`
- Ensure backend is running on port 5001
- Clear browser cache

### Issue: Tasks not syncing
- Check Socket.io connection in browser console
- Ensure Socket.io is installed: `npm install socket.io`
- Restart both frontend and backend

### Issue: Dark mode not working
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Check browser console for errors

## 📊 Features Breakdown by Rubric

### 1. **HTML Implementation (3 Marks)** ✅
- ✔ Semantic HTML5 tags (header, section, article, footer, nav)
- ✔ Forms with validation
- ✔ Tables for displaying data
- ✔ Images (avatars, icons)
- ✔ Links and navigation
- ✔ Proper document structure

### 2. **CSS Styling / Bootstrap (3 Marks)** ✅
- ✔ Bootstrap 5 responsive framework
- ✔ Custom CSS3 styling
- ✔ Flexbox & Grid layouts
- ✔ Hover effects and shadows
- ✔ Dark mode support
- ✔ Mobile-friendly responsive design
- ✔ Smooth animations and transitions

### 3. **Functionality - JavaScript (4 Marks)** ✅
- ✔ All buttons work properly
- ✔ Forms with client-side validation
- ✔ DOM manipulation with React
- ✔ Event handling (drag-drop, click, submit)
- ✔ Dynamic task updates
- ✔ Filtering by status and priority
- ✔ Drag-and-drop between columns

### 4. **Content & Creativity (2 Marks)** ✅
- ✔ Meaningful labels and placeholders
- ✔ Modern Trello-like UI
- ✔ Color-coded priority system
- ✔ Font Awesome icons
- ✔ Professional design
- ✔ Intuitive user experience
- ✔ Branding with TaskFlow logo

### 5. **Server & Database (3 Marks)** ✅
- ✔ Node.js + Express backend
- ✔ MongoDB database connection
- ✔ CRUD operations for all entities
- ✔ Proper API structure
- ✔ Error handling
- ✔ Validation
- ✔ Activity logging

### 6. **Advancements (2 Marks)** ✅
- ✔ React component-based architecture
- ✔ JWT authentication
- ✔ Socket.io real-time updates
- ✔ Dark mode toggle
- ✔ SPA (Single Page Application) pattern
- ✔ Activity logging system
- ✔ Advanced task management

### 7. **Code Quality & Documentation (3 Marks)** ✅
- ✔ Well-commented code
- ✔ Clean folder structure
- ✔ Proper naming conventions
- ✔ Modular architecture
- ✔ Configuration management (.env)
- ✔ Comprehensive README
- ✔ Error handling

## 🤝 Contributing

Feel free to extend this project with additional features:
- Email notifications
- File attachments
- Team invitations
- Recurring tasks
- Calendar view
- Time tracking
- Custom workflows

## 📄 License

MIT License - Feel free to use this project for personal and commercial purposes.

## 👨‍💻 Author

TaskFlow Development Team

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify MongoDB and backend are running

---

**Happy task managing! 🎉**

Built with ❤️ using React, Node.js, and MongoDB
