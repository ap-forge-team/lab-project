import React from 'react'
import { ShieldCheck, Home, FileCheck, DollarSign, Headphones } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <ShieldCheck size={24} />,
      title: 'NABL Accredited Labs',
      desc: 'Certified labs across India',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: <Home size={24} />,
      title: 'Free Home Collection',
      desc: 'On orders above ₹999',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: <FileCheck size={24} />,
      title: 'Accurate Reports',
      desc: 'NABL Certified Labs',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: <DollarSign size={24} />,
      title: 'Fast Reports',
      desc: 'Reports in 6-24 Hours',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: <Headphones size={24} />,
      title: '24/7 Support',
      desc: 'We are always available',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  ]

  return (
    <section className="bg-white py-6">
      <div className="enterprise-container">
        {/* Desktop: Card with vertical dividers */}
        <div className="hidden lg:block border border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="flex items-center justify-between">
            {features.map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center gap-3 px-6 py-5 flex-1">
                  <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={item.iconColor}>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                {index < features.length - 1 && (
                  <div className="w-px h-12 bg-gray-200 flex-shrink-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile: Stacked list with aligned icons */}
        <div className="flex flex-col gap-5 lg:hidden">
          {features.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <span className={item.iconColor}>{item.icon}</span>
              </div>
              <div>
                <p className="text-base font-semibold text-foreground leading-tight">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
