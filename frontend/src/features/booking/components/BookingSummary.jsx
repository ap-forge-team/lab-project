import React from 'react'
import { Shield, Info, CalendarDays, Clock, MapPin, User } from 'lucide-react'

export default function BookingSummary({ selectedItem, type, onContinue, loading, currentStep, formData, collectionPreference }) {
  if (!selectedItem) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Summary</h2>
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
          Select a test or package to view summary
        </div>
      </div>
    )
  }

  const price = selectedItem.price || selectedItem.offerPrice || 0

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-heading font-bold text-lg text-foreground">Booking Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Test Details */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Test Details</h4>
          <div className="bg-accent/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{selectedItem.title}</span>
              <span className="text-sm font-bold text-foreground">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{type === 'package' ? 'Health Package' : 'Lab Test'}</p>
          </div>
        </div>

        {/* Patient Details */}
        {currentStep >= 1 && formData?.patientName && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patient Details</h4>
            <div className="bg-accent/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{formData.patientName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-5">
                <span>{formData.age} Years</span>
                <span>•</span>
                <span>{formData.gender}</span>
              </div>
              {formData.phone && (
                <p className="text-xs text-muted-foreground ml-5">{formData.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Sample Collection Address */}
        {currentStep >= 2 && formData?.city && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample Collection Address</h4>
            <div className="bg-accent/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formData.flatNo}{formData.landmark ? `, ${formData.landmark}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.address}, {formData.city} - {formData.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {currentStep >= 3 && (formData?.bookingDate || formData?.bookingTime) && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Appointment Details</h4>
            <div className="bg-accent/50 rounded-lg p-3 space-y-2">
              {formData.bookingDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{formData.bookingDate}</span>
                </div>
              )}
              {formData.bookingTime && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{formData.bookingTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Test Amount</span>
              <span className="text-sm text-foreground">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Home Collection</span>
              <span className="text-sm text-green-600 font-medium">FREE</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total Amount</span>
            <span className="text-sm font-bold text-primary">₹{price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-800">You will not be charged now.</p>
            <p className="text-xs text-blue-600">Payment to be collected during sample collection.</p>
          </div>
        </div>

        {/* Action Button */}
        {currentStep < 4 && (
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        )}

        {/* Security Badge */}
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Shield size={12} /> Your data is 100% secure
        </p>
      </div>
    </div>
  )
}
