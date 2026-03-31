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

    const { title, description, status, priority, dueDate, assignee } =
      req.body;

    // Validate: Cannot mark done without assignee and dueDate\n    if (status === \"done\" && !assignee) {\n      return res.status(400).json({\n        success: false,\n        message: \"Assignee is required before marking task as done\",\n      });\n    }\n\n    // Log activity for changed fields\n    const changes = [];\n    if (title && title !== task.title) changes.push(`title: ${task.title} → ${title}`);\n    if (description && description !== task.description) changes.push(\"description updated\");\n    if (status && status !== task.status) changes.push(`status: ${task.status} → ${status}`);\n    if (priority && priority !== task.priority) changes.push(`priority: ${task.priority} → ${priority}`);\n    if (assignee && assignee !== task.assignee?.toString()) changes.push(\"assignee changed\");\n\n    // Update fields\n    if (title) task.title = title;\n    if (description !== undefined) task.description = description;\n    if (status) task.status = status;\n    if (priority) task.priority = priority;\n    if (dueDate) task.dueDate = dueDate;\n    if (assignee) task.assignee = assignee;\n\n    // Add activity log\n    if (changes.length > 0) {\n      task.activityLog.push({\n        action: \"updated\",\n        changedBy: req.user.id,\n        details: { changes },\n      });\n    }\n\n    await task.save();\n    await task.populate(\"assignee\", \"name email profileImage\");\n    await task.populate(\"creator\", \"name email profileImage\");\n    await task.populate(\"activityLog.changedBy\", \"name profileImage\");\n\n    res.json({\n      success: true,\n      message: \"Task updated successfully\",\n      task,\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      message: error.message,\n    });\n  }\n});\n\n// DELETE TASK - Delete task\n// DELETE /api/tasks/:id\nrouter.delete(\"/:id\", auth, async (req, res) => {\n  try {\n    const task = await Task.findById(req.params.id);\n\n    if (!task) {\n      return res.status(404).json({\n        success: false,\n        message: \"Task not found\",\n      });\n    }\n\n    // Check access - only creator or project owner can delete\n    const project = await Project.findById(task.project);\n    const canDelete =\n      task.creator.toString() === req.user.id ||\n      project.owner.toString() === req.user.id;\n\n    if (!canDelete) {\n      return res.status(403).json({\n        success: false,\n        message: \"You do not have permission to delete this task\",\n      });\n    }\n\n    await Task.findByIdAndDelete(req.params.id);\n\n    res.json({\n      success: true,\n      message: \"Task deleted successfully\",\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      message: error.message,\n    });\n  }\n});\n\n// ADD COMMENT - Add comment to task\n// POST /api/tasks/:id/comments\nrouter.post(\"/:id/comments\", auth, async (req, res) => {\n  try {\n    const { text } = req.body;\n\n    if (!text) {\n      return res.status(400).json({\n        success: false,\n        message: \"Comment text is required\",\n      });\n    }\n\n    const task = await Task.findById(req.params.id);\n    if (!task) {\n      return res.status(404).json({\n        success: false,\n        message: \"Task not found\",\n      });\n    }\n\n    task.comments.push({\n      user: req.user.id,\n      text,\n    });\n\n    // Log activity\n    task.activityLog.push({\n      action: \"commented\",\n      changedBy: req.user.id,\n      details: { comment: text },\n    });\n\n    await task.save();\n    await task.populate(\"comments.user\", \"name profileImage\");\n\n    res.json({\n      success: true,\n      message: \"Comment added successfully\",\n      comments: task.comments,\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      message: error.message,\n    });\n  }\n});\n\nmodule.exports = router;"