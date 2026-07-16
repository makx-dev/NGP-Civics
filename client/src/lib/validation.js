import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export const reportIssueSchema = z.object({
  photos: z
    .array(
      z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB').refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only PNG, JPG, and WEBP files are accepted'
      )
    )
    .min(1, 'At least one photo is required')
    .max(5, 'Maximum 5 photos allowed'),
  category: z.string().min(1, 'Please select a category'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be under 500 characters'),
  priority: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1, 'Location is required'),
    area: z.string().optional(),
    ward: z.string().optional(),
    city: z.string().optional(),
  }),
})

export const defaultFormValues = {
  photos: [],
  category: '',
  title: '',
  description: '',
  priority: '',
  location: {
    lat: 21.1458, // Nagpur default
    lng: 79.0882,
    address: '',
    area: '',
    ward: '',
    city: '',
  },
}