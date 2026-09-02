import React from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Shield, Clock, Users, Wallet, ClipboardList, Home, FlaskConical, FileText, TestTube, Award, Building2, Star, ChevronRight } from 'lucide-react'
import microscopeImg from '@/assets/image/about-us-microscope.png'
import familyImg from '@/assets/image/about-us-family.png'
import sideImg from '@/assets/image/about-us-sideimage.png'

const whyChoose = [
  {
    icon: Shield,
    title: 'Accurate & Reliable',
    desc: 'Advanced technology and strict quality standards ensure 99% accuracy.',
  },
  {
    icon: Clock,
    title: 'Timely Reports',
    desc: 'Quick turnaround time with digital reports delivered right to you.',
  },
  {
    icon: Users,
    title: 'Patient First',
    desc: 'We prioritize your comfort and convenience at every step.',
  },
  {
    icon: Wallet,
    title: 'Affordable Pricing',
    desc: 'High quality tests at transparent and competitive prices.',
  },
]

const stats = [
  { icon: TestTube, value: '1200+', label: 'Tests Available' },
  { icon: Users, value: '1M+', label: 'Happy Customers' },
  { icon: Building2, value: '50+', label: 'Labs Pan India' },
  { icon: Award, value: '10+', label: 'Years of Excellence' },
]

const steps = [
  {
    icon: ClipboardList,
    n: '01',
    title: 'Book Your Test',
    desc: 'Choose a test or package and schedule your appointment.',
  },
  {
    icon: Home,
    n: '02',
    title: 'Sample Collection',
    desc: 'Our phlebotomists visit your home for safe and hassle-free sample collection.',
  },
  {
    icon: FlaskConical,
    n: '03',
    title: 'Lab Testing',
    desc: 'Samples are tested in NABL accredited labs using advanced technology.',
  },
  {
    icon: FileText,
    n: '04',
    title: 'Get Your Reports',
    desc: 'Receive accurate digital reports quickly via email and SMS.',
  },
]

export default function AboutUs() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100 pt-0 pb-6 lg:pb-10">
          <div className="enterprise-container">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                  About Us
                </span>
                <h1 className="font-heading font-bold text-4xl lg:text-5xl text-gray-900 mb-4 leading-tight">
                  Your Health, <br />
                  <span className="text-blue-600">Our Priority</span>
                </h1>
                <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-6 max-w-lg">
                  At Checked Up, we believe that accurate diagnostics are the first step towards a healthier life. We are committed to providing reliable, timely and affordable lab tests with a patient-first approach.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-full w-fit">
                  <Shield size={16} className="text-blue-600" />
                  <span>NABL Accredited Laboratories</span>
                </div>
              </div>
              <div className="relative hidden lg:flex justify-end">
                <img
                  src={microscopeImg}
                  alt="Lab Microscope"
                  className="w-full max-w-xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-10 lg:py-12 bg-white">
          <div className="enterprise-container">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-6">
              Why Choose Checked Up?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChoose.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <h3 className="font-heading font-bold text-gray-900 mb-1.5 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 bg-gray-50 border-y border-gray-100">
          <div className="enterprise-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-xl text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-10 lg:py-12 bg-white">
          <div className="enterprise-container">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-8">
              How We Work
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {steps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.n} className="relative">
                    {i < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-7 left-[calc(50%+32px)] w-[calc(100%-64px)] border-t-2 border-dashed border-blue-200 z-0" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
                          <Icon size={22} className="text-blue-600" />
                        </div>
                        <span className="font-heading font-bold text-xl text-blue-600">{step.n}</span>
                      </div>
                      <h3 className="font-heading font-bold text-gray-900 mb-1.5 text-sm">{step.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-10 lg:py-12 bg-white">
          <div className="enterprise-container">
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative h-64 lg:h-auto min-h-[280px]">
                  <img
                    src={familyImg}
                    alt="Happy Family"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-heading font-bold text-base text-blue-600 mb-1.5">Our Mission</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        To make quality diagnostics accessible to every individual by combining technology, transparency and trust.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-blue-600 mb-1.5">Our Vision</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        To be India's most trusted healthcare diagnostics brand, empowering people to live healthier lives.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1 hidden lg:flex items-center justify-center p-5">
                  <img
                    src={sideImg}
                    alt="Microscope Illustration"
                    className="w-full max-w-[120px] object-contain opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="enterprise-container text-center">
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-6">Trusted by Thousands</h3>
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 opacity-50">
              <span className="text-lg font-bold text-gray-500">TATA 1mg</span>
              <span className="text-lg font-bold text-gray-500">practo</span>
              <span className="text-lg font-bold text-gray-500">PharmEasy</span>
              <span className="text-lg font-bold text-gray-500">yatra</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-500">Google</span>
                <span className="text-sm text-gray-500">4.8</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-gray-400">(12K+ Reviews)</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="enterprise-container text-center">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">
              Ready to book your first test?
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Home collection is available in 50+ cities, with reports usually ready within a day.
            </p>
            <button
              onClick={() => navigate(ROUTES.TESTS)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
            >
              Book a Test
              <ChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
