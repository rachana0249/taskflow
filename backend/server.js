/**
 * TaskFlow Backend Server
 * Real-time Team Collaboration and Task Manager
 * 
 * Features:
 * - JWT Authentication
 * - Project Management (CRUD)
 * - Task Management with Kanban board
 * - Real-time updates with Socket.io
 * - Activity logging
 * - User comments and collaboration
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/projects", require("./routes/projects"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Socket.io Real-time Updates
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join project board
  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  // Task created
  socket.on("task-created", (data) => {
    io.to(`project-${data.projectId}`).emit("task-created", data);
  });

  // Task updated
  socket.on("task-updated", (data) => {
    io.to(`project-${data.projectId}`).emit("task-updated", data);
  });

  // Task deleted
  socket.on("task-deleted", (data) => {
    io.to(`project-${data.projectId}`).emit("task-deleted", data);
  });

  // Task status changed (drag-drop)
  socket.on("task-status-changed", (data) => {
    io.to(`project-${data.projectId}`).emit("task-status-changed", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/taskflow")
  .then(() => {
    console.log("✓ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("✗ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 WebSocket enabled for real-time updates\n`);
});

module.exports = { app, io };