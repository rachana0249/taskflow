const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    }).select("_id");
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignee creator")
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, projectId } = req.body;
    const task = new Task({ title, project: projectId, creator: req.user.id, status: "todo" });
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, status, assignee } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { title, status, assignee }, { new: true });
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;"