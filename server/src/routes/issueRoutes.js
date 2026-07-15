const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Category = require('../models/Category');
const StatusHistory = require('../models/StatusHistory');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../utils/notification');

const router = express.Router();

const statusOrder = [
  'Complaint Submitted',
  'Assigned to Department',
  'Engineer Assigned',
  'Inspection Scheduled',
  'Work Started',
  'Work Completed',
  'Citizen Verification Pending',
  'Resolved',
  'REOPENED',
];
const priorityOrder = ['Low', 'Medium', 'High'];

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

const toPositiveInteger = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
};

const buildIssueFilter = ({ auth, query }) => {
  const filter = {};

  if (auth.role === 'user') {
    filter.reporter = auth.id;
  }

  const { category, status, priority, fromDate, toDate, search, hasLocation } = query;

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.category = category;
  }

  if (status && statusOrder.includes(status)) {
    filter.status = status;
  }

  if (priority && priorityOrder.includes(priority)) {
    filter.priority = priority;
  }

  if (fromDate && isValidDate(fromDate)) {
    filter.createdAt = { ...(filter.createdAt || {}), $gte: new Date(fromDate) };
  }

  if (toDate && isValidDate(toDate)) {
    filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(toDate) };
  }

  if (hasLocation === 'true') {
    filter.$or = [
      { 'location.lat': { $type: 'number' } },
      { 'location.lng': { $type: 'number' } },
      { 'location.address': { $exists: true, $ne: '' } },
    ];
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      ...(filter.$or || []),
      { title: searchRegex },
      { description: searchRegex },
      { 'location.address': searchRegex },
    ];
  }

  return filter;
};

router.get('/', protect(), async (req, res) => {
  try {
    const filter = buildIssueFilter({ auth: req.auth, query: req.query });
    const page = toPositiveInteger(req.query.page, 1, 1, 1000);
    const limit = toPositiveInteger(req.query.limit, 10, 1, 100);
    const sortBy = ['createdAt', 'updatedAt', 'priority', 'status'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'createdAt';
    const sortDirection = req.query.sortOrder === 'asc' ? 1 : -1;

    const [total, issues] = await Promise.all([
      Issue.countDocuments(filter),
      Issue.find(filter)
        .sort({ [sortBy]: sortDirection, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name')
        .populate('reporter', 'name email')
        .populate('assignedAdmin', 'name email department'),
    ]);

    return res.json({
      data: issues,
      meta: {
        total,
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get('/summary', protect('admin'), async (_req, res) => {
  try {
    const [totals, byCategory, recentActivity] = await Promise.all([
      Issue.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
            },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            pending: 1,
            inProgress: 1,
            resolved: 1,
          },
        },
      ]),
      Issue.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: '$categoryDoc' },
        { $group: { _id: '$categoryDoc.name', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, category: '$_id', count: 1 } },
      ]),
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('category', 'name')
        .populate('reporter', 'name email')
        .populate('assignedAdmin', 'name email department'),
    ]);

    const overview = totals[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 };

    return res.json({
      overview,
      byCategory,
      recentActivity,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

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
      status: 'Complaint Submitted',
    });

    await StatusHistory.create({
      issue: issue._id,
      fromStatus: 'Complaint Submitted',
      toStatus: 'Complaint Submitted',
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

// Provides a single, role-authorized payload for a before/after comparison UI.
router.get('/:id/photo-comparison', protect(), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).select(
      'reporter photos completionPhoto completionPhotoUploadedAt'
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (req.auth.role === 'user' && String(issue.reporter) !== req.auth.id) {
      return res.status(403).json({ message: 'Not allowed to view this issue comparison' });
    }

    return res.json({
      before: issue.photos,
      after: issue.completionPhoto
        ? {
            url: issue.completionPhoto,
            uploadedAt: issue.completionPhotoUploadedAt || null,
          }
        : null,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }
});

// The citizen is the only actor who can close an issue after work is completed.
router.post('/:id/verification', protect('user'), async (req, res) => {
  try {
    const { decision, remark } = req.body;

    if (!['Fixed', 'Not Fixed'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be either "Fixed" or "Not Fixed"' });
    }

    if (typeof remark !== 'undefined' && (typeof remark !== 'string' || remark.length > 500)) {
      return res.status(400).json({ message: 'Verification remark must be 500 characters or fewer' });
    }

    const issue = await Issue.findOne({
      _id: req.params.id,
      reporter: req.auth.id,
      status: 'Citizen Verification Pending',
    });

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found or is not awaiting citizen verification',
      });
    }

    const previousStatus = issue.status;
    issue.status = decision === 'Fixed' ? 'Resolved' : 'REOPENED';
    await issue.save();

    await StatusHistory.create({
      issue: issue._id,
      fromStatus: previousStatus,
      toStatus: issue.status,
      changedByUser: req.auth.id,
      remark: remark?.trim() || `Citizen marked the issue as ${decision}.`,
    });

    await createNotification({
      recipient: issue.reporter,
      issue: issue._id,
      type: issue.status === 'Resolved' ? 'Issue Resolved' : 'Issue Reopened',
      message:
        issue.status === 'Resolved'
          ? `You confirmed that "${issue.title}" is fixed.`
          : `You reported that "${issue.title}" is not fixed. The issue has been reopened.`,
    });

    const updatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name')
      .populate('reporter', 'name email')
      .populate('assignedAdmin', 'name email department');

    return res.json(updatedIssue);
  } catch (error) {
    return res.status(400).json({ message: error.message });
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
