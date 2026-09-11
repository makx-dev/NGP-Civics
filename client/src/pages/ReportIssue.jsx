import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react'
import Hero from '../components/report/Hero'
import ProgressStepper from '../components/report/ProgressStepper'
import PhotoUploader from '../components/report/PhotoUploader'
import CategorySelector from '../components/report/CategorySelector'
import IssueForm from '../components/report/IssueForm'
import LocationPicker from '../components/report/LocationPicker'
import ReviewCard from '../components/report/ReviewCard'
import SuccessModal from '../components/report/SuccessModal'
import LoadingSkeleton from '../components/report/LoadingSkeleton'
import { defaultFormValues } from '../lib/validation'
import api from '../lib/api'

const STORAGE_KEY = 'ngp_report_issue_draft'

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

export default function ReportIssue() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [formData, setFormData] = useState(defaultFormValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const saveTimeout = useRef(null)
  const hasUnsaved = useRef(false)

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Load saved draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.photos && Array.isArray(parsed.photos)) {
          parsed.photos = parsed.photos.filter((p) => p.preview)
        }
        setFormData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Autosave with debounce
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      try {
        const toSave = {
          ...formData,
          photos: formData.photos.map((f) => ({ uid: f.uid, name: f.name, size: f.size, type: f.type, preview: f.preview })),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        hasUnsaved.current = true
      } catch {
        // Storage quota exceeded or other error
      }
    }, 800)
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [formData])

  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsaved.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      if (field === 'location') {
        delete next.location
      } else {
        delete next[field]
      }
      return next
    })
  }, [])

  const updateLocation = useCallback((location) => {
    setFormData((prev) => ({ ...prev, location }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.location
      return next
    })
  }, [])

  const validateStep = (step) => {
    const errs = {}
    if (step === 1) {
      if (!formData.category) errs.category = 'Please select a category'
      if (!formData.title?.trim()) errs.title = 'Title is required'
      if (!formData.description?.trim()) errs.description = 'Description is required'
    } else if (step === 2) {
      if (!formData.location?.address?.trim()) {
        errs.location = { address: 'Please select or search a location' }
      }
    } else if (step === 3) {
      if (!formData.photos || formData.photos.length === 0) {
        errs.photos = { message: 'At least one photo is required' }
      }
      if (formData.photos.length > 5) {
        errs.photos = { message: 'Maximum 5 photos allowed' }
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1)
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const goToStep = (step) => {
    if (step < currentStep) {
      setDirection(-1)
      setCurrentStep(step)
    } else if (step > currentStep) {
      if (validateStep(currentStep)) {
        setDirection(1)
        setCurrentStep(step)
      }
    }
  }

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const step1Valid = validateStep(1)
    const step2Valid = validateStep(2)
    const step3Valid = validateStep(3)
    if (!step1Valid || !step2Valid || !step3Valid) {
      if (!step1Valid) { setDirection(1); setCurrentStep(1); return }
      if (!step2Valid) { setDirection(1); setCurrentStep(2); return }
      if (!step3Valid) { setDirection(1); setCurrentStep(3); return }
    }
    setIsSubmitting(true)
    try {
      // 1. Resolve Category ID from backend if needed
      let categoryId = formData.category
      try {
        const catRes = await api.get('/categories')
        if (Array.isArray(catRes.data) && catRes.data.length > 0) {
          const matched = catRes.data.find(
            (c) => c._id === formData.category ||
                   c.name.toLowerCase().includes(String(formData.category).toLowerCase()) ||
                   String(formData.category).toLowerCase().includes(c.name.toLowerCase())
          )
          if (matched) {
            categoryId = matched._id
          } else if (!formData.category || !formData.category.match(/^[0-9a-fA-F]{24}$/)) {
            categoryId = catRes.data[0]._id
          }
        }
      } catch (err) {
        console.warn('Categories lookup warning:', err.message)
      }

      // Format photos array for backend
      const formattedPhotos = (formData.photos || []).map((p, idx) => ({
        url: p.preview || (typeof p === 'string' ? p : 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'),
        caption: p.name || `Photo ${idx + 1}`,
      }))

      // JSON payload expected by POST /api/issues
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: categoryId,
        location: {
          lat: typeof formData.location?.lat === 'number' ? formData.location.lat : 21.1458,
          lng: typeof formData.location?.lng === 'number' ? formData.location.lng : 79.0882,
          address: formData.location?.address?.trim() || 'Nagpur, Maharashtra',
        },
        photos: formattedPhotos.slice(0, 5),
        priority: 'Medium',
      }

      // Save directly to MongoDB
      const response = await api.post('/issues', payload)
      const savedIssue = response.data

      const assignedComplaintId = savedIssue.complaintId || `NGP-${String(savedIssue._id || Date.now()).slice(-6).toUpperCase()}`
      setComplaintId(assignedComplaintId)
      setShowSuccess(true)
      hasUnsaved.current = false
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Submit error:', err)
      setErrors({ submit: err.response?.data?.message || 'Failed to submit report. Please check the form fields and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <CategorySelector
              value={formData.category}
              onChange={(value) => updateField('category', value)}
              error={errors.category}
            />
            <IssueForm
              formData={formData}
              onChange={updateField}
              errors={errors}
            />
          </div>
        )
      case 2:
        return (
          <LocationPicker
            location={formData.location}
            onLocationChange={updateLocation}
            errors={errors}
          />
        )
      case 3:
        return (
          <PhotoUploader
            files={formData.photos}
            onFilesChange={(files) => updateField('photos', files)}
            errors={errors}
          />
        )
      case 4:
        return (
          <ReviewCard
            formData={formData}
            onEdit={goToStep}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Hero />

      <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-black/10 sm:p-8">
        <ProgressStepper currentStep={currentStep} />

        <div className="mt-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={currentStep === 1 ? () => navigate('/citizen/dashboard') : prevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700"
          >
            <ArrowLeft size={16} />
            {currentStep === 1 ? 'Back to Dashboard' : 'Back'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {errors.submit}
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccess}
        complaintId={complaintId}
        onTrack={() => navigate('/citizen/issues')}
        onDashboard={() => navigate('/citizen/dashboard')}
      />

      {/* Unsaved indicator */}
      {hasUnsaved.current && !showSuccess && (
        <div className="fixed bottom-4 right-4 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-400">Draft saved locally</span>
          </div>
        </div>
      )}
    </div>
  )
}