import React from 'react'
import {
  Calendar,
  Cookie,
  Settings,
  BarChart3,
  CheckCircle,
  Mail,
  Phone,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import cookieImg from '@/assets/image/cookie-policy-hero.png'

const cookieTypes = [
  {
    type: 'Essential Cookies',
    purpose: 'Required for core website functionality',
    duration: 'Session / Persistent',
  },
  {
    type: 'Performance Cookies',
    purpose: 'Helps us improve website performance',
    duration: 'Up to 2 years',
  },
  {
    type: 'Functional Cookies',
    purpose: 'Remember your preferences and settings',
    duration: 'Up to 1 year',
  },
  {
    type: 'Targeting Cookies',
    purpose: 'Deliver relevant ads and measure campaign performance',
    duration: 'Up to 1 year',
  },
]

const sections = [
  {
    icon: Cookie,
    title: 'What Are Cookies?',
    content: 'Cookies are small text files that are placed on your device when you visit a website. They help the website remember your actions and preferences (such as login, language, and other display settings) for a period of time.',
  },
  {
    icon: Settings,
    title: 'How We Use Cookies',
    content: 'We use cookies for the following purposes:',
    list: [
      { label: 'Essential Cookies', desc: 'These cookies are necessary for the website to function properly and cannot be disabled.' },
      { label: 'Performance Cookies', desc: 'These cookies help us understand how visitors interact with our website by collecting information anonymously.' },
      { label: 'Functional Cookies', desc: 'These cookies enable enhanced functionality and personalization.' },
      { label: 'Targeting/Advertising Cookies', desc: 'These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant ads.' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Types of Cookies We Use',
    content: '',
    table: true,
  },
  {
    icon: Settings,
    title: 'Your Choices',
    content: 'You can choose to accept or decline cookies. You can also set or change your browser settings to block or delete cookies. Please note that some parts of our website may not function properly if cookies are disabled.',
    button: true,
  },
  {
    icon: CheckCircle,
    title: 'Changes to This Policy',
    content: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with the updated date.',
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: 'If you have any questions about our use of cookies, please contact us.',
    contact: true,
  },
]

export default function CookiePolicy() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* HERO */}
        <section className="enterprise-container py-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                Cookie Policy
              </span>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 leading-tight mb-4">
                Cookie Policy
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
                This Cookie Policy explains what cookies are, how we use them,
                and the choices you have regarding cookies when you visit our
                website.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50 p-6">
                <img
                  src={cookieImg}
                  alt="Checked Up cookie policy"
                  className="w-full h-[280px] md:h-[340px] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <section className="enterprise-container pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
                      {section.content && (
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {section.content}
                        </p>
                      )}

                      {/* List for How We Use Cookies */}
                      {section.list && (
                        <div className="flex flex-col gap-3 mt-3">
                          {section.list.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-500">
                                <span className="text-gray-900 font-medium">{item.label}:</span> {item.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Table for Types of Cookies */}
                      {section.table && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-900">Cookie Type</th>
                                <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-900">Purpose</th>
                                <th className="text-left py-3 text-sm font-semibold text-gray-900">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cookieTypes.map((cookie, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0">
                                  <td className="py-3 pr-4 text-sm text-gray-900">{cookie.type}</td>
                                  <td className="py-3 pr-4 text-sm text-gray-500">{cookie.purpose}</td>
                                  <td className="py-3 text-sm text-gray-500">{cookie.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Button for Your Choices */}
                      {section.button && (
                        <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition">
                          <Settings size={16} />
                          Manage Cookie Preferences
                        </button>
                      )}

                      {/* Contact */}
                      {section.contact && (
                        <div className="flex items-center gap-4 mt-3">
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
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
