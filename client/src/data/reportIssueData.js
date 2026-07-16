import {
  Road,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Car,
  Construction,
  TrafficCone,
  Building2,
  ClipboardList,
} from 'lucide-react'

export const categories = [
  { id: 'road-damage', label: 'Road Damage', icon: Road, description: 'Potholes, cracks, or uneven roads' },
  { id: 'garbage', label: 'Garbage', icon: Trash2, description: 'Improper waste disposal or littering' },
  { id: 'street-light', label: 'Street Light', icon: Lightbulb, description: 'Non-functional or broken street lights' },
  { id: 'water-leakage', label: 'Water Leakage', icon: Droplets, description: 'Leaking pipes or water wastage' },
  { id: 'drainage', label: 'Drainage', icon: Waves, description: 'Blocked or overflowing drains' },
  { id: 'illegal-parking', label: 'Illegal Parking', icon: Car, description: 'Unauthorised or obstructive parking' },
  { id: 'encroachment', label: 'Encroachment', icon: Construction, description: 'Illegal construction or encroachment' },
  { id: 'traffic-signal', label: 'Traffic Signal', icon: TrafficCone, description: 'Malfunctioning traffic signals' },
  { id: 'public-property-damage', label: 'Public Property Damage', icon: Building2, description: 'Damaged public infrastructure' },
  { id: 'other', label: 'Other', icon: ClipboardList, description: 'Any other civic issue' },
]

export const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Minor issue, no urgency' },
  { value: 'medium', label: 'Medium', description: 'Needs attention soon' },
  { value: 'high', label: 'High', description: 'Urgent, requires immediate action' },
]

export const steps = [
  { id: 1, label: 'Photos', description: 'Upload issue images' },
  { id: 2, label: 'Details', description: 'Describe the issue' },
  { id: 3, label: 'Location', description: 'Pin the location' },
  { id: 4, label: 'Review', description: 'Confirm and submit' },
]

export const mockSubmitResponse = {
  success: true,
  complaintId: 'NGP-2026-001245',
  status: 'Submitted',
  message: 'Your report has been submitted successfully.',
  timestamp: new Date().toISOString(),
}