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
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react'

export const categories = [
  { id: 'road-damage', label: 'Road Damage (Potholes)', icon: Road, description: 'Potholes, cracks, or uneven roads' },
  { id: 'streetlights', label: 'Streetlights', icon: Lightbulb, description: 'Non-functional or broken street lights' },
  { id: 'garbage', label: 'Garbage', icon: Trash2, description: 'Improper waste disposal or littering' },
  { id: 'water-leakage', label: 'Water Leakage', icon: Droplets, description: 'Leaking pipes or water wastage' },
  { id: 'public-washroom-hygiene', label: 'Public Washroom Hygiene', icon: Droplets, description: 'Unclean or damaged public restrooms' },
  { id: 'drainage', label: 'Drainage', icon: Waves, description: 'Blocked or overflowing drains' },
  { id: 'traffic-signal', label: 'Traffic Signal', icon: TrafficCone, description: 'Malfunctioning traffic signals' },
  { id: 'spitting', label: 'Spitting', icon: ShieldAlert, description: 'Public spitting or hygiene violations' },
  { id: 'public-property-damage', label: 'Public Property Damage', icon: Building2, description: 'Damaged public infrastructure' },
  { id: 'encroachment', label: 'Encroachment', icon: Construction, description: 'Illegal construction or encroachment' },
  { id: 'animal-welfare', label: 'Animal Welfare', icon: HeartHandshake, description: 'Stray animal issues, rescue, or abuse' },
  { id: 'illegal-parking', label: 'Illegal Parking', icon: Car, description: 'Unauthorised or obstructive parking' },
  { id: 'others', label: 'Others', icon: ClipboardList, description: 'Any other civic issue' },
]

export const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Minor issue, no urgency' },
  { value: 'medium', label: 'Medium', description: 'Needs attention soon' },
  { value: 'high', label: 'High', description: 'Urgent, requires immediate action' },
]

export const steps = [
  { id: 1, label: 'Details', description: 'Describe the issue' },
  { id: 2, label: 'Location', description: 'Pin the location' },
  { id: 3, label: 'Photos', description: 'Upload issue images' },
  { id: 4, label: 'Review', description: 'Confirm and submit' },
]