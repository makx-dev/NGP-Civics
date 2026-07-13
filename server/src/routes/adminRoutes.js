const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Category = require('../models/Category');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../utils/notification');

const router = express.Router();

const statusOrder = ['Pending', 'In Progress', 'Resolved'];

router.use(protect('admin'));

router.get('/issues', async (req, res) => {
  try {
    const { category, status, priority, fromDate, toDate, search, hasLocation } = req.query;
    const query = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (status && statusOrder.includes(status)) {
      query.status = status;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query.priority = priority;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    if (hasLocation === 'true') {
      query.$or = [
        ...(query.$or || []),
        { 'location.lat': { $ne: null }, 'location.lng': { $ne: null } },
        { 'location.address': { $exists: true, $ne: '' } },
      ];
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('category', 'name')
      .populate('reporter', 'name email')
      .populate('assignedAdmin', 'name email department');

    return res.json(issues);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.patch('/issues/:id', async (req, res) => {
  try {
    const { category, status, priority, adminRemarks, completionPhoto, assignedAdmin } = req.body;

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

    if (typeof adminRemarks === 'string') {
      issue.adminRemarks = adminRemarks;
    }

    if (status) {
      if (!statusOrder.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (statusOrder.indexOf(status) < statusOrder.indexOf(previousStatus)) {
        return res.status(400).json({ message: 'Status cannot move backward' });
      }

      issue.status = status;
    }

    if (issue.status === 'Resolved') {
      if (!completionPhoto && !issue.completionPhoto) {
        return res.status(400).json({ message: 'Completion photo is required when resolving an issue' });
      }

      if (completionPhoto) {
        issue.completionPhoto = completionPhoto;
      }
    }

    await issue.save();

    if (previousStatus !== issue.status) {
      await StatusHistory.create({
        issue: issue._id,
        fromStatus: previousStatus,
        toStatus: issue.status,
        changedByAdmin: req.auth.id,
        remark: issue.adminRemarks,
      });

      await createNotification({
        recipient: issue.reporter,
        issue: issue._id,
        type: issue.status === 'Resolved' ? 'Issue Resolved' : 'Status Changed',
        message:
          issue.status === 'Resolved'
            ? `Your issue "${issue.title}" has been resolved.`
            : `Your issue "${issue.title}" status changed to ${issue.status}.`,
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name')
      .populate('reporter', 'name email')
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

module.exports = router;
