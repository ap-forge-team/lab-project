import React from 'react'

export const BloodIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C12 2 5 10 5 14.5C5 18.09 8.13 21 12 21C15.87 21 19 18.09 19 14.5C19 10 12 2 12 2Z" fill="#EF4444" />
    <path d="M12 6C12 6 8 11 8 14C8 16.21 9.79 18 12 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
)

export const FlaskIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 3V10L4 19C3.5 19.8 4.1 21 5.1 21H18.9C19.9 21 20.5 19.8 20 19L15 10V3" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3H15" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 15H17" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
)

export const ShieldPlusIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3 7V12C3 17.25 6.75 21.5 12 22.75C17.25 21.5 21 17.25 21 12V7L12 2Z" fill="#8B5CF6" />
    <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const HeartPulseIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#EC4899" />
    <path d="M4 12H8L10 8L14 16L16 12H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const KidneyIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 4C4.5 4 3 6.5 3 9C3 12 5 14 7 16C9 18 10 20 10 22H14C14 20 15 18 17 16C19 14 21 12 21 9C21 6.5 19.5 4 17 4C15 4 13.5 5.5 12 7C10.5 5.5 9 4 7 4Z" fill="#F97316" />
    <ellipse cx="8" cy="9" rx="2" ry="2.5" fill="white" opacity="0.3" />
    <ellipse cx="16" cy="9" rx="2" ry="2.5" fill="white" opacity="0.3" />
  </svg>
)

export const LiverIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 10C4 6 7 3 12 3C17 3 20 6 20 10C20 14 18 17 14 19C12 20 10 20 8 19C5 17 4 14 4 10Z" fill="#DC2626" />
    <path d="M12 3V19" stroke="white" strokeWidth="1" opacity="0.3" />
    <circle cx="8" cy="10" r="1.5" fill="white" opacity="0.2" />
  </svg>
)

export const ThyroidIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C10.5 2 9.5 3 9.5 4.5V8C8 9 6 11 6 14C6 17 8 20 12 22C16 20 18 17 18 14C18 11 16 9 14.5 8V4.5C14.5 3 13.5 2 12 2Z" fill="#F472B6" />
    <circle cx="9" cy="12" r="1.5" fill="white" opacity="0.4" />
    <circle cx="15" cy="12" r="1.5" fill="white" opacity="0.4" />
  </svg>
)

export const StomachIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 2C8 2 6 4 6 7C6 10 5 12 4 14C3 16 4 20 8 21C12 22 16 20 18 16C20 12 18 8 16 6C14 4 12 4 11 5" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M10 6C11 5 12 5 13 6" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const BrainIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C9 2 7 4 7 6C5 6 3 8 3 10.5C3 13 5 14 6 15C5 16 5 18 7 19C9 20 10 20 12 20C14 20 15 20 17 19C19 18 19 16 18 15C19 14 21 13 21 10.5C21 8 19 6 17 6C17 4 15 2 12 2Z" fill="#14B8A6" />
    <path d="M12 4V18" stroke="white" strokeWidth="1" opacity="0.3" />
    <path d="M8 8C9 9 10 9 12 8" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    <path d="M16 8C15 9 14 9 12 8" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
  </svg>
)

export const UserIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" fill="#F97316" />
    <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

export const DnaIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 2C7 6 10 8 12 10C14 12 17 14 17 18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 2C17 6 14 8 12 10C10 12 7 14 7 18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="4" x2="16" y2="4" stroke="#3B82F6" strokeWidth="1.5" />
    <line x1="9" y1="7" x2="15" y2="7" stroke="#3B82F6" strokeWidth="1.5" />
    <line x1="9" y1="13" x2="15" y2="13" stroke="#3B82F6" strokeWidth="1.5" />
    <line x1="8" y1="16" x2="16" y2="16" stroke="#3B82F6" strokeWidth="1.5" />
  </svg>
)

export const PillIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="12" width="14" height="8" rx="4" transform="rotate(-45 12 12)" fill="#F97316" />
    <path d="M8 9L15 16" stroke="white" strokeWidth="1.5" opacity="0.4" />
  </svg>
)

export const RibbonIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L9 12L2 8L5 18L12 14L19 18L22 8L15 12L12 2Z" fill="#EC4899" />
    <circle cx="12" cy="10" r="2" fill="white" opacity="0.4" />
  </svg>
)

export const MicroscopeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="3" stroke="#3B82F6" strokeWidth="2" />
    <path d="M12 11V17M8 21H16M12 17V21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 8H8M16 8H18" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const StethoscopeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 4V10C6 13.31 8.69 16 12 16C15.31 16 18 13.31 18 10V4" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="18" r="2" fill="#14B8A6" />
    <path d="M4 4H8" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const MedicalIcons = [
  { id: 'blood', label: 'Blood', Icon: BloodIcon },
  { id: 'flask', label: 'Lab', Icon: FlaskIcon },
  { id: 'shield', label: 'Shield', Icon: ShieldPlusIcon },
  { id: 'heart', label: 'Heart', Icon: HeartPulseIcon },
  { id: 'kidney', label: 'Kidney', Icon: KidneyIcon },
  { id: 'liver', label: 'Liver', Icon: LiverIcon },
  { id: 'thyroid', label: 'Thyroid', Icon: ThyroidIcon },
  { id: 'stomach', label: 'Stomach', Icon: StomachIcon },
  { id: 'brain', label: 'Brain', Icon: BrainIcon },
  { id: 'user', label: 'General', Icon: UserIcon },
  { id: 'dna', label: 'DNA', Icon: DnaIcon },
  { id: 'pill', label: 'Pharmacy', Icon: PillIcon },
  { id: 'ribbon', label: 'Awareness', Icon: RibbonIcon },
  { id: 'microscope', label: 'Microscope', Icon: MicroscopeIcon },
  { id: 'stethoscope', label: 'Checkup', Icon: StethoscopeIcon },
]

export const getIconById = (id) => {
  const found = MedicalIcons.find((item) => item.id === id)
  return found ? found.Icon : FlaskIcon
}
