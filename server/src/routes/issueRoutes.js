const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Category = require('../models/Category');
const StatusHistory = require('../models/StatusHistory');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../utils/notification');

const router = express.Router();

router.post('/', protect('user'), async (req, res) => {
  try {
    const { title, description, category, location, photos = [], priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryExists = await Category.exists({ _id: category, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category does not exist or is inactive' });
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      photos,
      priority,
      reporter: req.auth.id,
      status: 'Pending',
    });

    await StatusHistory.create({
      issue: issue._id,
      fromStatus: 'Pending',
      toStatus: 'Pending',
      changedByUser: req.auth.id,
      remark: 'Issue submitted',
    });

    await createNotification({
      recipient: req.auth.id,
      issue: issue._id,
      type: 'Issue Submitted',
      message: `Your issue "${issue.title}" has been submitted successfully.`,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name')
      .populate('reporter', 'name email');

    return res.status(201).json(populatedIssue);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get('/mine', protect('user'), async (req, res) => {
  try {
    const issues = await Issue.find({ reporter: req.auth.id })
      .sort({ createdAt: -1 })
      .populate('category', 'name');

    return res.json(issues);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect(), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('category', 'name')
      .populate('reporter', 'name email')
      .populate('assignedAdmin', 'name email department');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (req.auth.role === 'user' && String(issue.reporter._id) !== req.auth.id) {
      return res.status(403).json({ message: 'Not allowed to access this issue' });
    }

    return res.json(issue);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }
});

router.patch('/:id', protect('user'), async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'location', 'photos'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, reporter: req.auth.id, status: 'Pending' },
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found or cannot be edited now' });
    }

    return res.json(issue);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect('user'), async (req, res) => {
  try {
    const result = await Issue.deleteOne({
      _id: req.params.id,
      reporter: req.auth.id,
      status: 'Pending',
    });

    if (!result.deletedCount) {
      return res.status(404).json({ message: 'Issue not found or cannot be deleted now' });
    }

    return res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }
});

router.get('/:id/history', protect(), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).select('reporter');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (req.auth.role === 'user' && String(issue.reporter) !== req.auth.id) {
      return res.status(403).json({ message: 'Not allowed to view history' });
    }

    const history = await StatusHistory.find({ issue: req.params.id })
      .sort({ changedAt: 1 })
      .populate('changedByUser', 'name email')
      .populate('changedByAdmin', 'name email department');

    return res.json(history);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }
});

module.exports = router;
