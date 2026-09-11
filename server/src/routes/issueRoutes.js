const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Category = require('../models/Category');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
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
    const [totals, byCategory, byStatus, recentActivity] = await Promise.all([
      Issue.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $in: ['$status', ['Complaint Submitted', 'Pending']] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      '$status',
                      [
                        'Assigned to Department',
                        'Engineer Assigned',
                        'Inspection Scheduled',
                        'Work Started',
                        'Work Completed',
                        'Citizen Verification Pending',
                        'REOPENED',
                        'In Progress',
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            resolved: {
              $sum: {
                $cond: [{ $in: ['$status', ['Resolved', 'Completed']] }, 1, 0],
              },
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
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
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
      byStatus,
      byCategory,
      recentActivity,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/notifications/me', protect('user'), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.auth.id })
      .sort({ createdAt: -1 })
      .populate('issue', 'title complaintId department')
      .limit(100);

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch('/notifications/read-all', protect('user'), async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.auth.id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch('/notifications/:id/read', protect('user'), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.auth.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json(notification);
  } catch (error) {
    return res.status(400).json({ message: error.message });
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

    const loc = location || {
      address: req.body.address || req.body.area || 'Nagpur',
      lat: typeof req.body.lat === 'number' ? req.body.lat : undefined,
      lng: typeof req.body.lng === 'number' ? req.body.lng : undefined,
    };

    // Citizens cannot self-assign 'High' priority to jump triage. Default to 'Medium' (or 'Low' if specifically requested).
    const sanitizedPriority = priority === 'Low' ? 'Low' : 'Medium';

    const issue = await Issue.create({
      title,
      description,
      category,
      location: loc,
      ward: req.body.ward || 'Ward 12 (Dharampeth / Central Nagpur)',
      photos,
      priority: sanitizedPriority,
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
      .populate('reporter', 'name email phone address avatar createdAt')
      .populate('assignedAdmin', 'name email department');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const reporterId = issue.reporter?._id ? issue.reporter._id.toString() : issue.reporter?.toString();
    if (req.auth.role !== 'admin' && reporterId !== req.auth.id) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this issue' });
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

    const reporterId = issue.reporter?._id ? issue.reporter._id.toString() : issue.reporter?.toString();
    if (req.auth.role !== 'admin' && reporterId !== req.auth.id) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view photos for this issue' });
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
    const { decision, remark, feedback, rating } = req.body;

    if (!['Fixed', 'Not Fixed'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be either "Fixed" or "Not Fixed"' });
    }

    const comment = feedback || remark;
    if (typeof comment !== 'undefined' && (typeof comment !== 'string' || comment.length > 500)) {
      return res.status(400).json({ message: 'Verification feedback must be 500 characters or fewer' });
    }

    const issue = await Issue.findOne({
      _id: req.params.id,
      reporter: req.auth.id,
      status: { $in: ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'] },
    });

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found or is not awaiting citizen verification',
      });
    }

    const previousStatus = issue.status;
    issue.status = decision === 'Fixed' ? 'Resolved' : 'REOPENED';
    issue.progress = decision === 'Fixed' ? 100 : 30;

    if (rating && Number.isFinite(Number(rating))) {
      issue.citizenRating = Math.min(5, Math.max(1, Number(rating)));
    }
    if (comment) {
      issue.citizenFeedback = comment.trim();
    }

    await issue.save();

    await StatusHistory.create({
      issue: issue._id,
      fromStatus: previousStatus,
      toStatus: issue.status,
      changedByUser: req.auth.id,
      remark:
        comment?.trim() ||
        (decision === 'Fixed'
          ? `Citizen confirmed resolution${rating ? ` (Rated ${rating}/5 ★)` : ''}.`
          : 'Citizen reported issue is not resolved. Reopened for municipal attention.'),
    });

    await createNotification({
      recipient: issue.reporter,
      issue: issue._id,
      type: issue.status === 'Resolved' ? 'Issue Resolved' : 'Issue Reopened',
      message:
        issue.status === 'Resolved'
          ? `You confirmed that "${issue.title}" is fixed. Thank you for making Nagpur cleaner and safer!`
          : `You reported that "${issue.title}" is not fixed. The issue has been reopened for priority action.`,
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

    const issue = await Issue.findOne({
      _id: req.params.id,
      reporter: req.auth.id,
      status: 'Complaint Submitted',
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found or cannot be edited now' });
    }

    if (typeof updates.title === 'string') {
      issue.title = updates.title.trim();
    }
    if (typeof updates.description === 'string') {
      issue.description = updates.description.trim();
    }
    if (Array.isArray(updates.photos)) {
      issue.photos = updates.photos;
    }
    if (updates.location) {
      const loc = updates.location;
      const hasGps = typeof loc.lat === 'number' && typeof loc.lng === 'number';
      const hasAddress = Boolean(loc.address && String(loc.address).trim());
      if (!hasGps && !hasAddress) {
        return res.status(400).json({ message: 'Provide GPS coordinates or a manual address' });
      }
      issue.location = {
        address: loc.address ? String(loc.address).trim() : '',
        lat: typeof loc.lat === 'number' ? loc.lat : undefined,
        lng: typeof loc.lng === 'number' ? loc.lng : undefined,
      };
    }

    await issue.save();
    await issue.populate('category', 'name');

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
      status: { $in: ['Complaint Submitted', 'Pending'] },
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

    const reporterId = issue.reporter?._id ? issue.reporter._id.toString() : issue.reporter?.toString();
    if (req.auth.role !== 'admin' && reporterId !== req.auth.id) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view history for this issue' });
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
