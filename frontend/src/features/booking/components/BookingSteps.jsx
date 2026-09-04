import { Check } from 'lucide-react'

const steps = [
  { label: 'Appointment Details', step: 1 },
  { label: 'Address & Location', step: 2 },
  { label: 'Date & Time', step: 3 },
  { label: 'Confirm Booking', step: 4 },
]

export default function BookingSteps({ currentStep = 1, onStepClick }) {
  return (
    <div className="flex items-center gap-2 md:gap-0 py-6">
      {steps.map((s, i) => {
        const isCompleted = s.step < currentStep
        const isCurrent = s.step === currentStep
        const isPending = s.step > currentStep
        return (
          <div key={s.step} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick?.(s.step)}
              disabled={s.step > currentStep}
              className={`flex items-center gap-2 disabled:cursor-default`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-white text-primary'
                    : isCurrent
                      ? 'bg-white text-primary ring-4 ring-white/20'
                      : 'bg-white/20 text-white/60'
                }`}
              >
                {isCompleted ? <Check size={16} /> : s.step}
              </span>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-white' : 'text-white/60'
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`hidden md:block w-12 lg:w-20 h-px mx-3 ${isCompleted ? 'bg-white' : 'bg-white/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
