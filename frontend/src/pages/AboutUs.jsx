import React from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Shield, ShieldCheck, Timer, Users, Wallet, ClipboardList, Home, FlaskConical, FileText, TestTube, Award, Building2, Star, ChevronRight } from 'lucide-react'
import microscopeImg from '@/assets/image/about-us-microscope.png'
import familyImg from '@/assets/image/about-us-family.png'
import sideImg from '@/assets/image/about-us-sideimage.png'

const whyChoose = [
  {
    icon: ShieldCheck,
    title: 'Accurate & Reliable',
    desc: 'Advanced technology and strict quality standards ensure 99% accuracy.',
  },
  {
    icon: Timer,
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

// Defensive container: keeps max-width + side padding even if the
// custom "enterprise-container" utility class isn't defined/loaded.
const CONTAINER = 'enterprise-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'

export default function AboutUs() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="">
          <div className="grid lg:grid-cols-5 items-stretch">
            <div className="lg:col-span-2 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4 w-fit">
                About Us
              </span>
              <h1 className="font-heading font-bold text-4xl lg:text-5xl text-gray-900 mb-4 leading-tight">
                Your Health, <br />
                <span className="text-blue-600">Our Priority</span>
              </h1>
              <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-6 max-w-lg">
                At Checked Up, we believe that accurate diagnostics are the first step towards a healthier life. We are committed to providing reliable, timely and affordable lab tests with a patient-first approach.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-full w-fit">
                <Shield size={16} className="text-blue-600" />
                <span>NABL Accredited Laboratories</span>
              </div>
            </div>

            <div className="lg:col-span-3 relative hidden lg:block min-h-[420px]">
              <img
                src={microscopeImg}
                alt="Lab Microscope"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-10 lg:py-12 bg-white">
          <div className={CONTAINER}>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-6">
              Why Choose Checked Up?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChoose.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Icon size={38} className="text-blue-600" />
                    </div>
                    <h3 className="font-heading font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section >
          <div className={CONTAINER}>
            <div className="bg-gray-50 rounded-2xl px-4 py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className={`flex items-center justify-center gap-4 py-8 px-6 ${i < stats.length - 1 ? 'lg:border-r border-gray-300' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-gray-300' : ''}`}>
                      <Icon size={50} className="text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-heading font-bold text-3xl text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-10 lg:py-12 bg-white">
          <div className={CONTAINER}>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-10">
              How We Work
            </h2>

            {/* Desktop */}
            <div className="hidden lg:grid grid-cols-4 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon

                return (
                  <div key={step.n} className="relative">
                    {/* Icon + Number */}
                    <div className="flex items-center gap-3 relative z-10">
                      {/* Icon */}
                      <div className="w-14 h-14 xl:w-16 xl:h-16 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon
                          size={26}
                          strokeWidth={1.8}
                          className="text-blue-600"
                        />
                      </div>

                      {/* Number */}
                      <span className="font-heading font-bold text-xl xl:text-2xl text-blue-600">
                        {step.n}
                      </span>
                    </div>

                    {/* Dashed connector with arrow */}
                    {i < steps.length - 1 && (
                      <div className="absolute top-7 left-[145px] right-[-20px] z-0 flex items-center">
                        <div className="flex-1 border-t-2 border-dashed border-blue-200" />
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 ml-1">
                          <path d="M1 5H9M9 5L6 2M9 5L6 8" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="ml-[70px] pr-2">
                      <h3 className="font-heading font-bold text-gray-900 text-md mb-2">
                        {step.title}
                      </h3>

                      <p className="text-sm text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile */}
            <div className="lg:hidden space-y-7">
              {steps.map((step) => {
                const Icon = step.icon

                return (
                  <div key={step.n} className="relative">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon
                          size={26}
                          strokeWidth={1.8}
                          className="text-blue-600"
                        />
                      </div>

                      <span className="font-heading font-bold text-xl text-blue-600">
                        {step.n}
                      </span>
                    </div>

                    <div className="ml-[70px] mt-3">
                      <h3 className="font-heading font-bold text-gray-900 text-sm mb-2">
                        {step.title}
                      </h3>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

       
        {/* Mission & Vision */}
        <section className="pb-10 lg:pb-12">
          <div className={CONTAINER}>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative max-h-[280px] overflow-hidden">
                  <img
                    src={familyImg}
                    alt="Happy Family"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
                  <div className="space-y-5">
                    <div className="pb-5 border-b border-gray-200">
                      <h3 className="font-heading font-bold text-lg text-blue-600 mb-1.5">Our Mission</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        To make quality diagnostics accessible to every individual by combining technology, transparency and trust.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-blue-600 mb-1.5">Our Vision</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        To be India's most trusted healthcare diagnostics brand, empowering people to live healthier lives.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1 hidden lg:flex items-center justify-center p-6">
                  <img
                    src={sideImg}
                    alt="Microscope Illustration"
                    className="w-full h-full max-w-[200px] max-h-[200px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}