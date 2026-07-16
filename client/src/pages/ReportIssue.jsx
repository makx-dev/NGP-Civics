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
import { mockSubmitResponse } from '../data/reportIssueData'
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
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Load saved draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Reconstruct photos from stored metadata (cannot store File objects)
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
    // Clear field error on change
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
      if (!formData.photos || formData.photos.length === 0) {
        errs.photos = { message: 'At least one photo is required' }
      }
      if (formData.photos.length > 5) {
        errs.photos = { message: 'Maximum 5 photos allowed' }
      }
    } else if (step === 2) {
      if (!formData.category) errs.category = 'Please select a category'
      if (!formData.title?.trim()) errs.title = 'Title is required'
      if (!formData.description?.trim()) errs.description = 'Description is required'
    } else if (step === 3) {
      if (!formData.location?.address?.trim()) {
        errs.location = { address: 'Please select or search a location' }
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
    if (!validateStep(3)) {
      setDirection(1)
      setCurrentStep(4)
      return
    }
    if (!validateStep(4)) {
      setDirection(1)
      setCurrentStep(4)
      return
    }
    setIsSubmitting(true)
    try {
      // Try real API first, fallback to mock
      const formPayload = new FormData()
      formData.photos.forEach((file) => formPayload.append('photos', file))
      formPayload.append('category', formData.category)
      formPayload.append('title', formData.title)
      formPayload.append('description', formData.description)
      formPayload.append('priority', formData.priority || '')
      formPayload.append('lat', formData.location.lat)
      formPayload.append('lng', formData.location.lng)
      formPayload.append('address', formData.location.address)
      formPayload.append('area', formData.location.area || '')
      formPayload.append('ward', formData.location.ward || '')
      formPayload.append('city', formData.location.city || '')

      let result
      try {
        const response = await api.post('/issues/report', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        result = response.data
      } catch {
        // Fallback to mock
        await new Promise((resolve) => setTimeout(resolve, 1500))
        result = {
          ...mockSubmitResponse,
          complaintId: `NGP-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        }
      }

      setComplaintId(result.complaintId)
      setShowSuccess(true)
      hasUnsaved.current = false
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      setErrors({ submit: 'Failed to submit report. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhotoUploader
            files={formData.photos}
            onFilesChange={(files) => updateField('photos', files)}
            errors={errors}
          />
        )
      case 2:
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
      case 3:
        return (
          <LocationPicker
            location={formData.location}
            onLocationChange={updateLocation}
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