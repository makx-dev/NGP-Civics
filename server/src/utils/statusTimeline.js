const statusTimeline = [
  'Complaint Submitted',
  'Assigned to Department',
  'Engineer Assigned',
  'Inspection Scheduled',
  'Work Started',
  'Work Completed',
  'Citizen Verification Pending',
  'Resolved',
];

const buildIssueTimeline = (currentStatus, history = []) =>
  statusTimeline.map((status, index) => {
    const currentHistory = history.find((entry) => entry.toStatus === status);
    const isCompleted = statusTimeline.indexOf(currentStatus) >= index;

    return {
      status,
      order: index + 1,
      isCompleted,
      isCurrent: currentStatus === status,
      changedAt: currentHistory?.changedAt || null,
      remark: currentHistory?.remark || null,
      changedByUser: currentHistory?.changedByUser || null,
      changedByAdmin: currentHistory?.changedByAdmin || null,
    };
  });

module.exports = { statusTimeline, buildIssueTimeline };