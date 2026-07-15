const mongoose = require('mongoose');

const issuePhotoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const issueTimeline = [
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

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        trim: true,
        maxlength: 240,
      },
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    photos: {
      type: [issuePhotoSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A maximum of 5 photos is allowed per issue',
      },
      default: [],
    },
    status: {
      type: String,
      enum: issueTimeline,
      default: 'Complaint Submitted',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    completionPhoto: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    completionPhotoUploadedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

issueSchema.pre('validate', function validateLocation(next) {
  if (!this.location) {
    return next(new Error('Location is required')); 
  }

  const hasGps = typeof this.location.lat === 'number' && typeof this.location.lng === 'number';
  const hasAddress = Boolean(this.location.address && this.location.address.trim());

  if (!hasGps && !hasAddress) {
    return next(new Error('Provide GPS coordinates or a manual address'));
  }

  return next();
});

module.exports = mongoose.model('Issue', issueSchema);
