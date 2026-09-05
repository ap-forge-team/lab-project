import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Calendar,
  FlaskConical,
  CheckCircle,
  Home,
  Clock,
  Shield,
  TestTube,
  DollarSign,
  Lock,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import useAuth from '@/hooks/useAuth'
import heroBg from '@/assets/hero/hero1.png'
import heroMain from '@/assets/hero/hero2.png'

const Hero = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const isPatient = !user || user?.role === ROLES.PATIENT

  const trustItems = [
    {
      icon: <CheckCircle size={16} className="text-green-500" />,
      bg: 'bg-green-50',
      title: '100% Accurate',
      desc: 'Reliable test results',
    },
    {
      icon: <Home size={16} className="text-primary" />,
      bg: 'bg-primary/10',
      title: 'Home Collection',
      desc: 'Safe & convenient',
    },
    {
      icon: <Clock size={16} className="text-primary" />,
      bg: 'bg-primary/10',
      title: 'Quick Reports',
      desc: 'Reports in 24-48 hrs',
    },
  ]

  const whyChooseItems = [
    {
      icon: <Shield size={18} className="text-primary" />,
      title: 'NABL Accredited Labs',
      desc: 'Quality you can trust',
    },
    {
      icon: <FlaskConical size={18} className="text-primary" />,
      title: 'Wide Range of Tests',
      desc: 'From routine to advanced',
    },
    {
      icon: <DollarSign size={18} className="text-primary" />,
      title: 'Affordable Pricing',
      desc: 'Best prices in the market',
    },
    {
      icon: <Lock size={18} className="text-primary" />,
      title: 'Secure & Private',
      desc: 'Your data is 100% safe',
    },
  ]

  return (
    <section
      className="relative pt-6 lg:pt-8 pb-6 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f0f4ff',
      }}
    >
      <div className="enterprise-container relative z-10">
        <div className="flex flex-row gap-4 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="w-[55%] lg:w-[35%] xl:w-[35%]">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 lg:gap-2 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 lg:px-3 lg:py-1 mb-3 lg:mb-4">
              <ShieldCheck size={14} className="text-primary lg:hidden" />
              <ShieldCheck size={18} className="text-primary hidden lg:block" />
              <span className="text-[10px] lg:type-primary-body-b3-medium tracking-wide">
                Trusted by 10,000+ Customers
              </span>
            </div>

            {/* Heading */}
            <h1 className="type-primary text-[24px] md:text-[35px] lg:text-[45px] !font-bold text-foreground leading-tight mb-2">
              Accurate Tests,
              <br />
              Reliable Results,
              <br />
              <span className="text-primary">Better Health</span>
            </h1>

            {/* Subtext */}
            <p className="text-muted-foreground text-xs lg:type-primary-body-b2 leading-relaxed mt-2 hidden lg:block">
              Book lab tests online from the comfort of your home.
              <br />
              Fast, reliable and affordable diagnostics for you and your family.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 lg:gap-3 mt-3 lg:mt-4">
              {isPatient && (
                <button
                  onClick={() => navigate(ROUTES.TESTS)}
                  className="inline-flex items-center gap-1.5 lg:gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg font-semibold text-xs lg:text-sm transition"
                >
                  <Calendar size={14} />
                  Book a Test
                </button>
              )}
              <button
                onClick={() => navigate(ROUTES.TESTS)}
                className="inline-flex items-center gap-1.5 lg:gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg font-semibold text-xs lg:text-sm transition"
              >
                <FlaskConical size={14} />
                Explore Tests
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-3 lg:gap-6 mt-4 lg:mt-6 flex-nowrap w-full">
              {trustItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 lg:gap-2">
                  <div
                    className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    {React.cloneElement(item.icon, { size: 14 })}
                  </div>
                  <div>
                    <p className="text-foreground text-[10px] lg:text-xs font-semibold leading-tight">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-[8px] lg:text-[10px] hidden lg:block">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="w-[45%] lg:w-[45%] xl:w-[45%] flex-shrink-0 flex justify-center">
            <img
              src={heroMain}
              alt="Lab microscope and test tubes"
              className="w-full max-w-[200px] lg:max-w-[600px] h-auto object-contain"
            />
          </div>

          {/* Why Choose Card - Desktop only */}
          <div className="hidden lg:block w-full lg:w-[20%] xl:w-[20%] flex-shrink-0 lg:-ml-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-5">
              <h3 className="font-heading font-bold text-foreground text-sm mb-4">
                Why Choose Checked Up?
              </h3>
              <div className="space-y-3">
                {whyChooseItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-semibold leading-tight">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero