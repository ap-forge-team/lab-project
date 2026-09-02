import React from 'react'
import { CircleUser } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
]

const getAvatarColor = (name) => {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const BookingCardHeader = ({ patientName, phone, variant = 'initials' }) => {
  return (
    <div className="p-4 pb-0">
      <div className="flex items-center gap-3">
        {variant === 'icon' ? (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CircleUser className="text-primary" size={20} />
          </div>
        ) : (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(patientName)} text-white font-semibold text-xs`}>
            {getInitials(patientName)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate" title={patientName}>
            {patientName}
          </h3>
          <p className="text-xs text-muted-foreground">{phone}</p>
        </div>
      </div>
    </div>
  )
}

export default BookingCardHeader
