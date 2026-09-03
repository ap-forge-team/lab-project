import React from 'react'
import { getIconById } from '@/components/icons/MedicalIcons'

const ICON_STYLES = {
  blood: { bg: 'bg-red-50', text: 'text-red-500' },
  flask: { bg: 'bg-teal-50', text: 'text-teal-500' },
  shield: { bg: 'bg-violet-50', text: 'text-violet-500' },
  heart: { bg: 'bg-pink-50', text: 'text-pink-500' },
  kidney: { bg: 'bg-orange-50', text: 'text-orange-500' },
  liver: { bg: 'bg-red-50', text: 'text-red-500' },
  thyroid: { bg: 'bg-pink-50', text: 'text-pink-500' },
  stomach: { bg: 'bg-teal-50', text: 'text-teal-500' },
  brain: { bg: 'bg-teal-50', text: 'text-teal-500' },
  user: { bg: 'bg-orange-50', text: 'text-orange-500' },
  dna: { bg: 'bg-blue-50', text: 'text-blue-500' },
  pill: { bg: 'bg-orange-50', text: 'text-orange-500' },
  ribbon: { bg: 'bg-pink-50', text: 'text-pink-500' },
  microscope: { bg: 'bg-blue-50', text: 'text-blue-500' },
  stethoscope: { bg: 'bg-teal-50', text: 'text-teal-500' },
}

const DEFAULT_ICON_STYLE = { bg: 'bg-blue-50', text: 'text-blue-500' }

const TestCardHeader = ({ testName, testCode, iconName }) => {
  const Icon = getIconById(iconName)
  const style = ICON_STYLES[iconName] || DEFAULT_ICON_STYLE

  return (
    <div className="p-4 pb-0">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate" title={testName}>
            {testName}
          </h3>
          <p className="text-xs text-muted-foreground">{testCode || '—'}</p>
        </div>
      </div>
    </div>
  )
}

export default TestCardHeader
