const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      enum: [
        'Complaint Submitted',
        'Assigned to Department',
        'Engineer Assigned',
        'Inspection Scheduled',
        'Work Started',
        'Work Completed',
        'Citizen Verification Pending',
        'Resolved',
        'REOPENED',
      ],
      required: true,
    },
    toStatus: {
      type: String,
      enum: [
        'Complaint Submitted',
        'Assigned to Department',
        'Engineer Assigned',
        'Inspection Scheduled',
        'Work Started',
        'Work Completed',
        'Citizen Verification Pending',
        'Resolved',
        'REOPENED',
      ],
      required: true,
    },
    changedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    remark: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

statusHistorySchema.pre('validate', function validateChangedBy(next) {
  const changedByCount = Number(Boolean(this.changedByUser)) + Number(Boolean(this.changedByAdmin));

  if (changedByCount !== 1) {
    const err = new Error('Status change must be linked to exactly one actor (user or admin)');
    if (typeof next === 'function') return next(err);
    throw err;
  }

  if (typeof next === 'function') return next();
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
