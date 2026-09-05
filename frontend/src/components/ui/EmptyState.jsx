import React from 'react'
import emptyPageImg from '@/assets/image/empty-page.png'

const EmptyState = ({ 
  title = 'No data found', 
  description, 
  actionLabel, 
  onAction,
  icon: Icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-64 h-54 lg:w-100 lg:h-75">
        {Icon ? (
          <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center">
            <Icon size={80} className="text-blue-300" strokeWidth={1.5} />
          </div>
        ) : (
          <img src={emptyPageImg} alt="Empty state" className="w-full h-full object-contain" />
        )}
      </div>
      <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm text-center max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
