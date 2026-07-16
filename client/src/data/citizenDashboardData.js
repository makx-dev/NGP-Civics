export const timelineSteps = [
  'Complaint Submitted',
  'Assigned to Department',
  'Engineer Assigned',
  'Inspection Scheduled',
  'Work Started',
  'Work Completed',
  'Waiting for Citizen Verification',
  'Resolved',
]

export const citizenDashboardData = {
  stats: [
    { label: 'Total Reports', value: '12', tone: 'slate' },
    { label: 'Pending', value: '03', tone: 'amber' },
    { label: 'In Progress', value: '06', tone: 'blue' },
    { label: 'Resolved', value: '03', tone: 'green' },
  ],
  issues: [
    {
      id: 'NGP-2026-0184',
      title: 'Pothole near IT Park entrance',
      category: 'Road Damage',
      department: 'Road Department',
      area: 'Dharampeth',
      status: 'Inspection Scheduled',
      priority: 'High',
      progress: 45,
      image: 'https://images.unsplash.com/photo-1581173188010-76c5b95f87d8?auto=format&fit=crop&w=360&q=80',
    },
    {
      id: 'NGP-2026-0171',
      title: 'Streetlight not working near market',
      category: 'Streetlights',
      department: 'Electrical Department',
      area: 'Sadar',
      status: 'Work Started',
      priority: 'Medium',
      progress: 62,
      image: 'https://images.unsplash.com/photo-1520127870051-3a5c5a13a7b2?auto=format&fit=crop&w=360&q=80',
    },
  ],
  activity: [
    { title: 'Road Department accepted your complaint.', time: 'Today, 10:42 AM', status: 'complete' },
    { title: 'Engineer assigned for IT Park entrance.', time: 'Today, 10:24 AM', status: 'complete' },
    { title: 'Inspection scheduled for your review.', time: 'Yesterday, 04:10 PM', status: 'current' },
    { title: 'Streetlight repair work started.', time: 'Yesterday, 11:15 AM', status: 'complete' },
  ],
  notifications: [
    { title: 'Inspection scheduled', description: 'Road Department scheduled an inspection for your pothole report.', time: '18 min ago', unread: true },
    { title: 'Engineer started work', description: 'Electrical Department has started work on your streetlight report.', time: 'Yesterday', unread: true },
    { title: 'Report received', description: 'Your road damage report was submitted successfully.', time: '2 days ago', unread: false },
  ],
  impact: { resolved: 128, time: '3.4 days', people: '2,480' },
}
