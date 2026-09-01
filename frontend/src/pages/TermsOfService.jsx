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
  ChevronDown,
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
        <section className="enterprise-container py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block type-primary-label-l2-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                Terms of Service
              </span>
              <h1 className="type-primary-heading-h0-mobile md:type-primary-heading-h0 text-foreground leading-tight mb-4">
                Terms of Service
              </h1>
              <p className="type-primary-body-b1 text-muted-foreground leading-relaxed mb-6 max-w-lg">
                These Terms of Service govern your use of Checked Up Lab Tests
                website and services. By accessing or using our platform, you
                agree to these terms and conditions.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="type-primary-body-b2-medium text-foreground">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50">
                <img
                  src={termsImg}
                  alt="Checked Up terms of service"
                  className="w-full h-[280px] md:h-[360px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <section className="enterprise-container py-10 lg:py-14">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="flex items-start gap-4 p-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="type-primary-heading-h3 text-foreground">
                      {index + 1}. {section.title}
                    </h3>
                    <p className="type-primary-body-b2 text-muted-foreground leading-relaxed mt-1">
                      {section.content}
                    </p>
                    {section.contact && (
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <a
                          href="mailto:support@checkedup.com"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Mail size={16} />
                          <span className="type-primary-body-b2-medium">support@checkedup.com</span>
                        </a>
                        <a href="tel:18001234567" className="flex items-center gap-2 text-primary hover:underline">
                          <Phone size={16} />
                          <span className="type-primary-body-b2-medium">1800-123-4567</span>
                        </a>
                      </div>
                    )}
                  </div>
                  <ChevronDown size={20} className="text-muted-foreground flex-shrink-0 mt-3" />
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}