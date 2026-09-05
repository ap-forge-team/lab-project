import React from 'react'
import { Stethoscope, CalendarCheck, FileCheck } from 'lucide-react'

const steps = [
  {
    icon: <Stethoscope size={28} />,
    title: 'Choose Your Test',
    description: 'Browse our wide range of lab tests and health packages. Select the tests recommended by your doctor or choose from our popular categories.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: <CalendarCheck size={28} />,
    title: 'Book An Appointment',
    description: 'Pick a date and time that works for you. Our trained phlebotomist will visit your home for sample collection — no hospital visits needed.',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: <FileCheck size={28} />,
    title: 'Get Results',
    description: 'Receive accurate, NABL-certified reports within 24-48 hours directly on your phone. Track your health over time with easy access to past reports.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

const HowItWorks = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="enterprise-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Getting your lab tests done is simple, fast, and hassle-free.
            Follow these easy steps from the comfort of your home.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center border border-border hover:shadow-lg transition-shadow duration-300"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-full ${step.iconBg} flex items-center justify-center mx-auto mb-5`}>
                <span className={step.iconColor}>{step.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
