import { ShieldCheck, Truck, Clock } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Certified Labs',
    description: 'NABL accredited laboratories',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Truck,
    title: 'Free Home Collection',
    description: 'Sample pickup from your address',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Clock,
    title: 'Fast Reports',
    description: 'Reports delivered in 6-24 hours',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
]

export default function WhatsIncluded() {
  return (
    <div className="border border-border rounded-xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.iconBg} ${f.iconColor}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
