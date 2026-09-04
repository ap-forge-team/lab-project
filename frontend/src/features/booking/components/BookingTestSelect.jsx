import { FlaskConical } from 'lucide-react'

export default function BookingTestSelect({ tests, packages, formData, errors, handleTestPackageChange }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical size={14} className="text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Selected Test / Package</span>
      </div>
      <div className="relative">
        <select
          name="test"
          value={formData.test || formData.package}
          required
          onChange={handleTestPackageChange}
          className={`
            w-full border border-border rounded-xl px-4 py-3.5 pr-10
            outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 
            text-sm text-foreground bg-card transition appearance-none
            ${errors.test ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
          `}
        >
          <option value="">Choose Test or Package</option>
          {tests.length > 0 && (
            <optgroup label="Tests">
              {tests.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title} — ₹{item.price?.toLocaleString('en-IN')}
                </option>
              ))}
            </optgroup>
          )}
          {packages.length > 0 && (
            <optgroup label="Packages">
              {packages.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title} — ₹{item.price?.toLocaleString('en-IN')}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {errors.test && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.test}</p>}
    </div>
  )
}
