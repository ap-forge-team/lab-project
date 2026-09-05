import React from 'react'
import {
  Calendar,
  Users,
  FileText,
  Share2,
  Lock,
  ShieldCheck,
  Cookie,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import privacyImg from '@/assets/image/privacy-policy-hero.png'

const sections = [
  {
    icon: Users,
    title: 'Information We Collect',
    content: 'We collect personal information that you provide to us, such as your name, email address, phone number, age, gender, and health-related information when you book a test or create an account. We also collect non-personal information automatically, including browser type, device information, IP address, and usage data.',
  },
  {
    icon: FileText,
    title: 'How We Use Your Information',
    content: 'We use your information to provide and improve our services, process your bookings, communicate with you about your tests and reports, send important updates, and ensure a smooth user experience. We may also use your information for analytics, research, and to comply with legal obligations.',
  },
  {
    icon: Share2,
    title: 'Sharing Your Information',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in delivering our services, such as laboratory partners, logistics providers, and payment gateways, under strict confidentiality agreements.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
  },
  {
    icon: ShieldCheck,
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You can also opt out of receiving promotional communications from us at any time. To exercise your rights, please contact us using the details provided below.',
  },
  {
    icon: Cookie,
    title: 'Cookies',
    content: 'Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, but some features of our site may not function properly.',
  },
  {
    icon: RefreshCw,
    title: 'Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated date. We encourage you to review this policy periodically.',
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us.',
    contact: true,
  },
]

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* HERO */}
        <section className="enterprise-container py-10 ">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                Privacy Policy
              </span>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 leading-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
                At Checked Up, we value your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                data when you use our website and services.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50 p-6">
                <img
                  src={privacyImg}
                  alt="Checked Up privacy policy"
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
                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">
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
