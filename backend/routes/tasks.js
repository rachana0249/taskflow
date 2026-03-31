/**
 * Tasks Routes
 * GET /api/tasks - Get all tasks for user's projects
 * GET /api/projects/:projectId/tasks - Get tasks for specific project
 * POST /api/tasks - Create new task
 * GET /api/tasks/:id - Get task details
 * PUT /api/tasks/:id - Update task
 * DELETE /api/tasks/:id - Delete task
 * POST /api/tasks/:id/comments - Add comment to task
 * POST /api/tasks/:id/activity - Log activity
 */

const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

// GET ALL TASKS - Get tasks from all user's projects
// GET /api/tasks
router.get("/", auth, async (req, res) => {
  try {
    // Get all projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { "members.user": req.user.id },
      ],
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    // Get tasks from those projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignee", "name email profileImage")
      .populate("creator", "name email profileImage")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET TASKS BY PROJECT - Get tasks for specific project
// GET /api/projects/:projectId/tasks
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check access
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email profileImage")
      .populate("creator", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE TASK - Create new task
// POST /api/tasks
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee, projectId } =
      req.body;

    // Validation
    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Task title and project are required",
      });
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      });
    }

    const task = new Task({
      title,
      description,
      priority: priority || "medium",
      dueDate,
      assignee,
      project: projectId,
      creator: req.user.id,
      status: "todo",
      activityLog: [
        {
          action: "created",
          changedBy: req.user.id,
          details: { title },
        },
      ],
    });

    await task.save();
    await task.populate("assignee", "name email profileImage");
    await task.populate("creator", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET TASK BY ID - Get task details
// GET /api/tasks/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email profileImage")
      .populate("creator", "name email profileImage")
      .populate("project", "name")
      .populate("comments.user", "name profileImage")
      .populate("activityLog.changedBy", "name profileImage");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check access
    const project = await Project.findById(task.project);
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE TASK - Update task details
// PUT /api/tasks/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check access
    const project = await Project.findById(task.project);
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;

    // Validate: Cannot mark done without assignee
    if (status === "done" && !assignee) {
      return res.status(400).json({
        success: false,
        message: "Assignee is required before marking task as done",
      });
    }

    // Log activity for changed fields
    const changes = [];
    if (title && title !== task.title) changes.push(`title: ${task.title} → ${title}`);
    if (description && description !== task.description) changes.push("description updated");
    if (status && status !== task.status) changes.push(`status: ${task.status} → ${status}`);
    if (priority && priority !== task.priority) changes.push(`priority: ${task.priority} → ${priority}`);
    if (assignee && assignee !== task.assignee?.toString()) changes.push("assignee changed");

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignee) task.assignee = assignee;

    // Add activity log
    if (changes.length > 0) {
      task.activityLog.push({
        action: "updated",
        changedBy: req.user.id,
        details: { changes },
      });
    }

    await task.save();
    await task.populate("assignee", "name email profileImage");
    await task.populate("creator", "name email profileImage");
    await task.populate("activityLog.changedBy", "name profileImage");

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE TASK - Delete task
// DELETE /api/tasks/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check access - only creator or project owner can delete
    const project = await Project.findById(task.project);
    const canDelete =
      task.creator.toString() === req.user.id ||
      project.owner.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADD COMMENT - Add comment to task
// POST /api/tasks/:id/comments
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.comments.push({
      user: req.user.id,
      text,
    });

    // Log activity
    task.activityLog.push({
      action: "commented",
      changedBy: req.user.id,
      details: { comment: text },
    });

    await task.save();
    await task.populate("comments.user", "name profileImage");

    res.json({
      success: true,
      message: "Comment added successfully",
      comments: task.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;"