import React from 'react'
import {
  Calendar,
  User,
  ClipboardList,
  UserCheck,
  CalendarCheck,
  IndianRupee,
  FlaskConical,
  Lock,
  CircleSlash,
  Scale,
  Mail,
  Phone,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import termsImg from '@/assets/image/terms-of-service-hero.png'

const sections = [
  {
    icon: User,
    title: 'Acceptance of Terms',
    content:
      'By accessing or using the Checked Up Lab Tests website or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must not use our services.',
  },
  {
    icon: ClipboardList,
    title: 'Services',
    content:
      'Checked Up provides online booking for diagnostic lab tests, home sample collection, and digital reports. We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice.',
  },
  {
    icon: UserCheck,
    title: 'User Responsibilities',
    content:
      'You agree to provide accurate and complete information while using our services. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointments and Cancellations',
    content:
      'Appointments can be booked online or through our support team. You can reschedule or cancel your appointment as per our cancellation policy. Missed appointments may be subject to applicable charges.',
  },
  {
    icon: IndianRupee,
    title: 'Payments and Refunds',
    content:
      'Payments must be made in advance to confirm your booking. Refunds, if applicable, will be processed as per our Refund Policy. We reserve the right to change our pricing at any time.',
  },
  {
    icon: FlaskConical,
    title: 'Test Results',
    content:
      'Test reports are generated and shared digitally. While we ensure accuracy, results should always be consulted with a qualified healthcare professional for medical advice.',
  },
  {
    icon: Lock,
    title: 'Intellectual Property',
    content:
      'All content on this website, including text, graphics, logos, and images, is the property of Checked Up and protected by applicable copyright and trademark laws. Unauthorized use is prohibited.',
  },
  {
    icon: CircleSlash,
    title: 'Limitation of Liability',
    content:
      'Checked Up shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our services.',
  },
  {
    icon: Scale,
    title: 'Changes to Terms',
    content:
      'We may update these Terms of Service from time to time. Any changes will be posted on this page with the updated date. Continued use of our services constitutes acceptance of the revised terms.',
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: 'If you have any questions about these Terms of Service, please contact us.',
    contact: true,
  },
]

export default function TermsOfService() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* HERO */}
        <section className="enterprise-container py-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                Terms of Service
              </span>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 leading-tight mb-4">
                Terms of Service
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
                These Terms of Service govern your use of Checked Up Lab Tests
                website and services. By accessing or using our platform, you
                agree to these terms and conditions.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50 p-6">
                <img
                  src={termsImg}
                  alt="Checked Up terms of service"
                  className="w-full h-[280px] md:h-[340px] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <section className="enterprise-container pb-10">
          <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={index}
                  className={`flex items-start gap-5 p-6 ${index < sections.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-blue-600 lg:hidden" />
                    <Icon size={28} className="text-blue-600 hidden lg:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
                      {index + 1}. {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {section.content}
                    </p>
                    {section.contact && (
                      <div className="flex items-center gap-4 mt-4">
                        <a href="mailto:support@checkedup.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Mail size={16} />
                          <span className="text-sm font-medium">support@checkedup.com</span>
                        </a>
                        <div className="w-px h-4 bg-gray-300" />
                        <a href="tel:18001234567" className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Phone size={16} />
                          <span className="text-sm font-medium">1800-123-4567</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}