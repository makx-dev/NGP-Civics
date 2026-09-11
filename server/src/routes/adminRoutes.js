const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Category = require('../models/Category');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
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

const allowedStatusTransitions = {
  'Complaint Submitted': ['Assigned to Department'],
  'Assigned to Department': ['Engineer Assigned'],
  'Engineer Assigned': ['Inspection Scheduled'],
  'Inspection Scheduled': ['Work Started'],
  'Work Started': ['Work Completed'],
  'Work Completed': ['Citizen Verification Pending'],
  'Citizen Verification Pending': [], // Verified by citizen
  Resolved: [],
  REOPENED: ['Work Started'],
};

const statusDefaultProgress = {
  'Complaint Submitted': 10,
  'Assigned to Department': 25,
  'Engineer Assigned': 40,
  'Inspection Scheduled': 55,
  'Work Started': 70,
  'Work Completed': 85,
  'Citizen Verification Pending': 90,
  Resolved: 100,
  REOPENED: 30,
};

const getStatusNotification = (issue) => {
  const messages = {
    'Assigned to Department': {
      type: 'Status Changed',
      message: `Your issue "${issue.title}" has been assigned to ${issue.department || 'the responsible department'}.`,
    },
    'Engineer Assigned': {
      type: 'Engineer Assigned',
      message: `Field Engineer ${issue.assignedOfficer || 'Municipal Engineer'} has been assigned to your issue "${issue.title}".`,
    },
    'Inspection Scheduled': {
      type: 'Inspection Scheduled',
      message: `An on-site inspection has been scheduled for your issue "${issue.title}".`,
    },
    'Work Started': {
      type: 'Work Started',
      message: `Work has started on your issue "${issue.title}". Progress: ${issue.progress || 70}%.`,
    },
    'Work Completed': {
      type: 'Work Completed',
      message: `Repairs have been completed on your issue "${issue.title}". Progress: ${issue.progress || 85}%.`,
    },
    'Citizen Verification Pending': {
      type: 'Verification Requested',
      message: `Work on "${issue.title}" is complete. Please review the after photo and verify the result.`,
    },
  };

  return messages[issue.status] || {
    type: 'Status Changed',
    message: `Your issue "${issue.title}" status changed to ${issue.status}.`,
  };
};

router.use(protect('admin'));

router.get('/issues', async (req, res) => {
  try {
    const { category, status, priority, fromDate, toDate, search, hasLocation } = req.query;
    let issueQuery = Issue.find();

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      issueQuery = issueQuery.where('category').equals(category);
    }

    if (status && statusOrder.includes(status)) {
      issueQuery = issueQuery.where('status').equals(status);
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      issueQuery = issueQuery.where('priority').equals(priority);
    }

    if (fromDate) {
      issueQuery = issueQuery.where('createdAt').gte(new Date(fromDate));
    }
    if (toDate) {
      issueQuery = issueQuery.where('createdAt').lte(new Date(toDate));
    }

    const issues = await issueQuery
      .sort({ createdAt: -1 })
      .populate('category', 'name')
      .populate('reporter', 'name email phone address avatar createdAt')
      .populate('assignedAdmin', 'name email department');

    let filteredIssues = issues;

    if (search) {
      const searchLower = String(search).toLowerCase();
      filteredIssues = filteredIssues.filter((issue) => {
        const locationAddress = issue.location?.address || '';
        return (
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower) ||
          locationAddress.toLowerCase().includes(searchLower) ||
          (issue.assignedOfficer && issue.assignedOfficer.toLowerCase().includes(searchLower)) ||
          (issue.department && issue.department.toLowerCase().includes(searchLower))
        );
      });
    }

    if (hasLocation === 'true') {
      filteredIssues = filteredIssues.filter((issue) => {
        const hasGps = typeof issue.location?.lat === 'number' && typeof issue.location?.lng === 'number';
        const hasAddress = Boolean(issue.location?.address);
        return hasGps || hasAddress;
      });
    }

    return res.json(filteredIssues);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.patch('/issues/:id', async (req, res) => {
  try {
    const {
      category,
      status,
      priority,
      adminRemarks,
      completionPhoto,
      assignedAdmin,
      department,
      assignedOfficer,
      assignedOfficerPhone,
      assignedOfficerRole,
      progress,
      scheduledInspectionDate,
      estimatedResolutionDate,
      ward,
    } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const previousStatus = issue.status;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const categoryExists = await Category.exists({ _id: category, isActive: true });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category does not exist or is inactive' });
      }

      issue.category = category;
    }

    if (assignedAdmin && mongoose.Types.ObjectId.isValid(assignedAdmin)) {
      issue.assignedAdmin = assignedAdmin;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      issue.priority = priority;
    }

    if (department && typeof department === 'string') {
      issue.department = department.trim();
    }

    if (typeof assignedOfficer === 'string') {
      issue.assignedOfficer = assignedOfficer.trim();
    }

    if (typeof assignedOfficerPhone === 'string') {
      issue.assignedOfficerPhone = assignedOfficerPhone.trim();
    }

    if (typeof assignedOfficerRole === 'string') {
      issue.assignedOfficerRole = assignedOfficerRole.trim();
    }

    if (typeof ward === 'string') {
      issue.ward = ward.trim();
    }

    if (scheduledInspectionDate) {
      issue.scheduledInspectionDate = new Date(scheduledInspectionDate);
    }

    if (estimatedResolutionDate) {
      issue.estimatedResolutionDate = new Date(estimatedResolutionDate);
    }

    if (typeof progress !== 'undefined' && Number.isFinite(Number(progress))) {
      issue.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    if (typeof adminRemarks === 'string') {
      issue.adminRemarks = adminRemarks;
    }

    if (typeof completionPhoto !== 'undefined') {
      if (typeof completionPhoto !== 'string' || !completionPhoto.trim()) {
        return res.status(400).json({ message: 'Completion photo must be a non-empty URL' });
      }

      issue.completionPhoto = completionPhoto.trim();
      issue.completionPhotoUploadedAt = new Date();
    }

    if (status) {
      if (!statusOrder.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (!allowedStatusTransitions[previousStatus]?.includes(status)) {
        return res.status(400).json({
          message: `Cannot change status from ${previousStatus} to ${status}`,
        });
      }

      issue.status = status;

      // If progress wasn't explicitly provided, advance progress automatically based on default mapping
      if (typeof progress === 'undefined') {
        issue.progress = statusDefaultProgress[status] || issue.progress;
      }
    }

    if (issue.status === 'Citizen Verification Pending') {
      if (!completionPhoto && !issue.completionPhoto) {
        return res.status(400).json({ message: 'Completion photo is required before citizen verification' });
      }
    }

    await issue.save();

    if (previousStatus !== issue.status || adminRemarks || assignedOfficer || typeof progress !== 'undefined') {
      await StatusHistory.create({
        issue: issue._id,
        fromStatus: previousStatus,
        toStatus: issue.status,
        changedByAdmin: req.auth.id,
        remark:
          issue.adminRemarks ||
          (assignedOfficer
            ? `Assigned to ${assignedOfficer} (${issue.assignedOfficerRole || 'Field Engineer'}) • Progress: ${issue.progress}%`
            : `Status advanced to ${issue.status} (Progress: ${issue.progress}%)`),
      });

      const notification = getStatusNotification(issue);

      let customMsg = notification.message;
      if (assignedOfficer && issue.status === 'Engineer Assigned') {
        customMsg = `Field Engineer ${assignedOfficer} (${issue.assignedOfficerRole || 'Lead Engineer'}) has been assigned to your issue "${issue.title}". Contact: ${issue.assignedOfficerPhone || 'Via Portal'}`;
      } else if (issue.progress) {
        customMsg += ` Resolution progress: ${issue.progress}%.`;
      }

      await createNotification({
        recipient: issue.reporter,
        issue: issue._id,
        type: notification.type,
        message: customMsg,
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name')
      .populate('reporter', 'name email phone address avatar createdAt')
      .populate('assignedAdmin', 'name email department');

    return res.json(updatedIssue);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get('/analytics/overview', async (req, res) => {
  try {
    const [byStatus, byCategory, resolutionTrends] = await Promise.all([
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
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
        { $project: { _id: 0, category: '$_id', count: 1 } },
      ]),
      StatusHistory.aggregate([
        { $match: { toStatus: 'Resolved' } },
        {
          $lookup: {
            from: 'issues',
            localField: 'issue',
            foreignField: '_id',
            as: 'issueDoc',
          },
        },
        { $unwind: '$issueDoc' },
        {
          $project: {
            month: { $dateToString: { format: '%Y-%m', date: '$changedAt' } },
            resolutionHours: {
              $divide: [{ $subtract: ['$changedAt', '$issueDoc.createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        {
          $group: {
            _id: '$month',
            avgResolutionHours: { $avg: '$resolutionHours' },
            resolvedCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: '$_id',
            avgResolutionHours: { $round: ['$avgResolutionHours', 2] },
            resolvedCount: 1,
          },
        },
      ]),
    ]);

    return res.json({ byStatus, byCategory, resolutionTrends });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/citizens/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-passwordHash -resetPasswordToken -resetPasswordExpires'
    );
    if (!user) {
      return res.status(404).json({ message: 'Citizen profile not found' });
    }

    const [totalIssues, resolvedIssues, activeIssues, recentIssues] = await Promise.all([
      Issue.countDocuments({ reporter: user._id }),
      Issue.countDocuments({ reporter: user._id, status: 'Resolved' }),
      Issue.countDocuments({ reporter: user._id, status: { $nin: ['Resolved', 'Completed'] } }),
      Issue.find({ reporter: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('category', 'name'),
    ]);

    return res.json({
      user,
      stats: {
        total: totalIssues,
        resolved: resolvedIssues,
        active: activeIssues,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
      },
      recentIssues,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
