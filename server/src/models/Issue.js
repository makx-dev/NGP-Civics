const mongoose = require('mongoose');
const Counter = require('./Counter');

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
    complaintId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
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
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'NMC Civic Administration',
    },
    assignedOfficer: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    assignedOfficerRole: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    assignedOfficerPhone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    ward: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'Ward 12 (Dharampeth / Central Nagpur)',
    },
    scheduledInspectionDate: {
      type: Date,
    },
    estimatedResolutionDate: {
      type: Date,
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
    citizenFeedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    citizenRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

issueSchema.pre('validate', function validateLocation(next) {
  if (!this.location) {
    const err = new Error('Location is required');
    if (typeof next === 'function') return next(err);
    throw err;
  }

  const hasGps = typeof this.location.lat === 'number' && typeof this.location.lng === 'number';
  const hasAddress = Boolean(this.location.address && this.location.address.trim());

  if (!hasGps && !hasAddress) {
    const err = new Error('Provide GPS coordinates or a manual address');
    if (typeof next === 'function') return next(err);
    throw err;
  }

  if (typeof next === 'function') return next();
});

issueSchema.pre('findOneAndUpdate', function validateLocationOnUpdate(next) {
  const update = this.getUpdate();
  const loc = update?.location || update?.$set?.location;
  if (loc) {
    const hasGps = typeof loc.lat === 'number' && typeof loc.lng === 'number';
    const hasAddress = Boolean(loc.address && String(loc.address).trim());
    if (!hasGps && !hasAddress) {
      const err = new Error('Provide GPS coordinates or a manual address');
      if (typeof next === 'function') return next(err);
      throw err;
    }
  }
  if (typeof next === 'function') return next();
});

issueSchema.pre('save', async function generateComplaintId(next) {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const counterId = `complaintId_${year}`;

    // Atomically increment the counter for this year
    let counter = await Counter.findById(counterId);
    if (!counter) {
      // Find highest existing complaintId sequence for this year to seed counter accurately
      const latestIssue = await mongoose
        .model('Issue')
        .findOne({ complaintId: new RegExp(`^NGP-${year}-`) })
        .sort({ complaintId: -1 });

      let initialSeq = 1000;
      if (latestIssue?.complaintId) {
        const parts = latestIssue.complaintId.split('-');
        const parsed = parseInt(parts[2], 10);
        if (Number.isFinite(parsed) && parsed >= 1000) {
          initialSeq = parsed;
        }
      }

      await Counter.updateOne(
        { _id: counterId },
        { $setOnInsert: { seq: initialSeq } },
        { upsert: true }
      );
    }

    const updatedCounter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const suffix = String(updatedCounter.seq).padStart(4, '0');
    this.complaintId = `NGP-${year}-${suffix}`;
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Issue', issueSchema);
