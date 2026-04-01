/**
 * TaskFlow - Real-time Team Collaboration and Task Manager
 * React Application with Bootstrap UI and Dark Mode
 * 
 * Features:
 * - User Authentication (Register/Login/Logout)
 * - Project Management (Create/Edit/Delete)
 * - Kanban Board (3 columns: Todo, Progress, Done)
 * - Drag & Drop Tasks
 * - Task Management (Create/Update/Delete)
 * - Real-time Updates with Socket.io
 * - Dark Mode Toggle
 * - Responsive Design
 * - Activity Logging
 */

const { useState, useEffect, useRef, useCallback } = React;
const API_URL = "https://taskflow-backendd.onrender.com/api";
let socket = null;

// ==================== LOGIN & REGISTER ====================
function LoginPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            <i className="fas fa-tasks me-2"></i>TaskFlow
          </h1>
          <p>Real-time Team Collaboration & Task Manager</p>
        </div>

        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${!isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              <i className="fas fa-user-plus me-2"></i>Register
            </button>
          </li>
        </ul>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : isLogin ? (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>Login
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>Create Account
              </>
            )}
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-muted text-center small">
          {isLogin
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ==================== NAVBAR ====================
function Navbar({ user, onLogout, darkMode, onToggleDarkMode }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container-fluid px-4">
        <a className="navbar-brand fw-bold" href="#/">
          <i className="fas fa-tasks me-2"></i>TaskFlow
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <button
                className="btn btn-light btn-sm me-3"
                onClick={onToggleDarkMode}
                title="Toggle Dark Mode"
              >
                <i className={`fas fa-${darkMode ? "sun" : "moon"}`}></i>
              </button>
            </li>

            <li className="nav-item dropdown">
              <button
                className="btn btn-light btn-sm dropdown-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={user?.profileImage}
                  alt={user?.name}
                  className="rounded-circle me-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />
                {user?.name}
              </button>

              {showDropdown && (
                <div className="dropdown-menu show">
                  <h6 className="dropdown-header">{user?.email}</h6>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={onLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// ==================== PROJECT LIST ====================
function ProjectList({ projects, onSelectProject, onCreateProject, onDeleteProject }) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDesc,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onCreateProject(data.project);
        setProjectName("");
        setProjectDesc("");
        setShowNewProject(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h5 className="mb-0">
          <i className="fas fa-folder me-2"></i>Projects
        </h5>
      </div>

      <button
        className="btn btn-sm btn-primary w-100 mb-3"
        onClick={() => setShowNewProject(!showNewProject)}
      >
        <i className="fas fa-plus me-2"></i>New Project
      </button>

      {showNewProject && (
        <form onSubmit={handleCreateProject} className="mb-3 p-2 bg-light rounded">
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
          <textarea
            className="form-control form-control-sm mb-2"
            placeholder="Description (optional)"
            rows="2"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
          ></textarea>
          <button type="submit" className="btn btn-sm btn-success w-100" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      <div className="projects-list">
        {projects.length === 0 ? (
          <p className="text-muted small text-center py-4">No projects yet</p>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className="project-item"
              onClick={() => onSelectProject(project._id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  <div className="project-name">
                    <i className="fas fa-folder me-2" style={{ color: project.color }}></i>
                    {project.name}
                  </div>
                  <small className="text-muted">{project.description}</small>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project._id);
                  }}
                  title="Delete project"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

// ==================== KANBAN BOARD ====================
function KanbanBoard({ projectId, projects }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [filter, setFilter] = useState("all");
  const [draggedTask, setDraggedTask] = useState(null);

  const project = projects.find((p) => p._id === projectId);

  // Load tasks
  useEffect(() => {
    if (!projectId) return;
    loadTasks();

    // Connect Socket.io
    connectSocket();
  }, [projectId]);

  const connectSocket = () => {
    if (!socket) {
      socket = io("https://taskflow-backendd.onrender.com");
      socket.emit("join-project", projectId);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          ...newTask,
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks((prev) => [...prev, data.task]);
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
        setShowNewTask(false);
        socket?.emit("task-created", data.task);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        socket?.emit("task-deleted", { taskId, projectId });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? data.task : t))
        );
        socket?.emit("task-status-changed", { taskId, newStatus, projectId });
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((t) => t.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#28a745",
      medium: "#ffc107",
      high: "#fd7e14",
      critical: "#dc3545",
    };
    return colors[priority] || "#6c757d";
  };

  if (!projectId) {
    return (
      <div className="main-content d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="fas fa-inbox" style={{ fontSize: "80px", color: "#ccc" }}></i>
          <h2 className="mt-3">No Project Selected</h2>
          <p className="text-muted">Select a project from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="board-header">
        <div>
          <h2>{project?.name}</h2>
          <p className="text-muted">{project?.description}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewTask(!showNewTask)}
        >
          <i className="fas fa-plus me-2"></i>Add Task
        </button>
      </div>

      {showNewTask && (
        <form onSubmit={handleCreateTask} className="new-task-form">
          <input
            type="text"
            className="form-control"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            className="form-control"
            placeholder="Description..."
            rows="2"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          ></textarea>
          <div className="row g-2">
            <div className="col-md-4">
              <select
                className="form-select"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-success w-100">
                Create Task
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="kanban-board">
          {["todo", "progress", "done"].map((status) => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <h5>
                  {status === "todo" && (
                    <>
                      <i className="fas fa-circle-notch me-2"></i>To Do
                    </>
                  )}
                  {status === "progress" && (
                    <>
                      <i className="fas fa-spinner me-2"></i>In Progress
                    </>
                  )}
                  {status === "done" && (
                    <>
                      <i className="fas fa-check-circle me-2"></i>Done
                    </>
                  )}
                </h5>
                <span className="badge bg-secondary">
                  {getTasksByStatus(status).length}
                </span>
              </div>

              <div className="column-tasks">
                {getTasksByStatus(status).length === 0 ? (
                  <div className="empty-column">
                    <p className="text-muted small">No tasks yet</p>
                  </div>
                ) : (
                  getTasksByStatus(status).map((task) => (
                    <div
                      key={task._id}
                      className="task-card"
                      draggable
                      onDragStart={() => setDraggedTask(task)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedTask && draggedTask._id !== task._id) {
                          handleUpdateTaskStatus(draggedTask._id, status);
                        }
                      }}
                    >
                      <div className="task-header">
                        <div>
                          <h6>{task.title}</h6>
                          <p className="task-description">{task.description}</p>
                        </div>
                        <div className="task-actions">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <div className="task-meta">
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(task.priority),
                          }}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="due-date">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {task.assignee && (
                        <div className="task-assignee">
                          <img
                            src={task.assignee.profileImage}
                            alt={task.assignee.name}
                            title={task.assignee.name}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN APP ====================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      loadProjects();
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleLoginSuccess = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    setIsLoggedIn(true);
    loadProjects();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setProjects([]);
    setSelectedProjectId(null);
  };

  const handleCreateProject = (project) => {
    setProjects((prev) => [...prev, project]);
    setSelectedProjectId(project._id);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        if (selectedProjectId === projectId) {
          setSelectedProjectId(projects[0]?._id || null);
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <div className="app-container">
        <ProjectList
          projects={projects}
          onSelectProject={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />

        <KanbanBoard projectId={selectedProjectId} projects={projects} />
      </div>
    </div>
  );
}

// Render App
ReactDOM.render(<App />, document.getElementById("root"));

// SAVE
async function saveTask() {
  const data = {
    title: tTitle.value,
    description: tDesc.value,
    status: tStatus.value,
    priority: tPriority.value,
    dueDate: tDate.value
  };

  if (currentId) {
    await fetch(`https://taskflow-backendd.onrender.com/${currentId}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json", Authorization: token},
      body: JSON.stringify(data)
    });
  } else {
    await fetch("https://taskflow-backendd.onrender.com", {
      method: "POST",
      headers: {"Content-Type":"application/json", Authorization: token},
      body: JSON.stringify(data)
    });
  }

  closeModal();
  loadTasks();
}

// DELETE
async function deleteTask(id) {
  await fetch(`https://taskflow-backendd.onrender.com/${id}`, {
    method: "DELETE",
    headers: { Authorization: token }
  });

  loadTasks();
}

// VIEW
async function viewTask(id) {
  const res = await fetch("https://taskflow-backendd.onrender.com/api/tasks", {
    headers: { Authorization: token }
  });

  const tasks = await res.json();
  const t = tasks.find(x => x._id === id);

viewData.innerHTML = `
  <b>Title:</b> ${t.title}<br>
  <b>Description:</b> ${t.description}<br>
  <b>Status:</b> ${t.status}<br>
  <b>Priority:</b> ${t.priority}<br>
  <b>Due Date:</b> ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""}
`;

  viewModal.style.display = "block";
}

// CLOSE
function closeModal(){ modal.style.display="none"; }
function closeView(){ viewModal.style.display="none"; }
function logout() {
  localStorage.removeItem("token");
  token = "";

  document.getElementById("board").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

 window.onload = function () {
  if (token) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("board").style.display = "block";
    loadTasks();
  }
};
async function login() {
  const res = await fetch("https://taskflow-backendd.onrender.com/api/auth/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  });

  const data = await res.json();

  localStorage.setItem("token", data.token);
  token = data.token;

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("board").style.display = "block";

  loadTasks();
}