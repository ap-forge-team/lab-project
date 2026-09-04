import { AlertCircle } from 'lucide-react'

export default function SampleCollectionPreference() {
  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm">🏠</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Home Collection</p>
            <p className="text-xs text-primary font-medium">FREE</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary mb-1">Important Fasting Instructions</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For accurate test results, please follow these instructions before your sample collection:
            </p>
            <ul className="mt-2 space-y-1">
              {[
                'Fast for 8-12 hours before sample collection (water is allowed)',
                'Avoid fatty foods the night before the test',
                'Avoid alcohol for 24 hours before the test',
                'Take your regular medications unless told otherwise by your doctor',
                'Get a good night\'s sleep before the test'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
