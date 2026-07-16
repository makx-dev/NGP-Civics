import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { steps } from '../../data/reportIssueData'

export default function ProgressStepper({ currentStep }) {
  return (
    <nav aria-label="Report progress" className="w-full">
      <ol className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, repeat: isCurrent ? 1 : 0 }}
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:h-10 sm:w-10 ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : isCurrent
                        ? 'border-2 border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_-3px_rgba(59,130,246,0.4)]'
                        : 'border border-slate-700 bg-slate-900 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} className="sm:hidden" />
                  ) : (
                    <span className="hidden text-xs sm:block">{step.id}</span>
                  )}
                  <span className="sm:hidden">
                    {isCompleted ? <Check size={16} /> : <span className="text-xs">{step.id}</span>}
                  </span>
                </motion.div>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      isCurrent
                        ? 'text-blue-400'
                        : isCompleted
                          ? 'text-white'
                          : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-600">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden h-px flex-1 transition-colors duration-500 sm:block ${
                    isCompleted ? 'bg-blue-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
      {/* Mobile step indicator */}
      <div className="mt-3 text-center sm:hidden">
        <p className="text-sm font-medium text-blue-400">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-xs text-slate-500">{steps[currentStep - 1]?.label}</p>
      </div>
    </nav>
  )
}