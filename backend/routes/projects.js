/**
 * Projects Routes
 * GET /api/projects - Get all user's projects
 * POST /api/projects - Create new project
 * GET /api/projects/:id - Get project by ID
 * PUT /api/projects/:id - Update project
 * DELETE /api/projects/:id - Delete project
 * POST /api/projects/:id/members - Add member to project
 * DELETE /api/projects/:id/members/:userId - Remove member from project
 */

const router = require("express").Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// GET ALL PROJECTS - Get projects where user is owner or member
// GET /api/projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { "members.user": req.user.id },
      ],
      status: "active",
    })
      .populate("owner", "name email profileImage")
      .populate("members.user", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE PROJECT - Create new project
// POST /api/projects
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = new Project({
      name,
      description,
      color: color || "#3498db",
      owner: req.user.id,
      members: [{ user: req.user.id, role: "owner" }],
    });

    await project.save();
    await project.populate("owner", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET PROJECT BY ID - Get single project details
// GET /api/projects/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email profileImage")
      .populate("members.user", "name email profileImage");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access
    const hasAccess =
      project.owner._id.toString() === req.user.id ||
      project.members.some((m) => m.user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE PROJECT - Update project details
// PUT /api/projects/:id
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can update project",
      });
    }

    const { name, description, color, status } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;

    await project.save();
    await project.populate("owner", "name email profileImage");
    await project.populate("members.user", "name email profileImage");

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE PROJECT - Delete project and all its tasks
// DELETE /api/projects/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete project",
      });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADD MEMBER - Add member to project
// POST /api/projects/:id/members
router.post("/:id/members", auth, async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can add members",
      });
    }

    // Check if member already exists
    const exists = project.members.some((m) => m.user.toString() === userId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Member already added to project",
      });
    }

    project.members.push({
      user: userId,
      role: role || "member",
    });

    await project.save();
    await project.populate("members.user", "name email profileImage");

    res.json({
      success: true,
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// REMOVE MEMBER - Remove member from project
// DELETE /api/projects/:id/members/:userId
router.delete("/:id/members/:userId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can remove members",
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();
    await project.populate("members.user", "name email profileImage");

    res.json({
      success: true,
      message: "Member removed successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;