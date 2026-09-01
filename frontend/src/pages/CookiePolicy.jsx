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
        <section className="enterprise-container py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block type-primary-label-l2-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                Cookie Policy
              </span>
              <h1 className="type-primary-heading-h0-mobile md:type-primary-heading-h0 text-foreground leading-tight mb-4">
                Cookie Policy
              </h1>
              <p className="type-primary-body-b1 text-muted-foreground leading-relaxed mb-6 max-w-lg">
                This Cookie Policy explains what cookies are, how we use them,
                and the choices you have regarding cookies when you visit our
                website.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="type-primary-body-b2-medium text-foreground">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50">
                <img
                  src={cookieImg}
                  alt="Checked Up cookie policy"
                  className="w-full h-[280px] md:h-[360px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <section className="enterprise-container py-10 lg:py-14">
          <div className="max-w-4xl mx-auto">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 mb-4 hover:shadow-sm transition"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="type-primary-heading-h3 text-foreground mb-2">
                      {index + 1}. {section.title}
                    </h3>
                    {section.content && (
                      <p className="type-primary-body-b2 text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    )}

                    {/* List for How We Use Cookies */}
                    {section.list && (
                      <div className="flex flex-col gap-3 mt-3">
                        {section.list.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                            <p className="type-primary-body-b2 text-muted-foreground">
                              <span className="text-foreground font-medium">{item.label}:</span> {item.desc}
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
                              <th className="text-left py-3 pr-4 type-primary-body-b2-medium text-foreground">Cookie Type</th>
                              <th className="text-left py-3 pr-4 type-primary-body-b2-medium text-foreground">Purpose</th>
                              <th className="text-left py-3 type-primary-body-b2-medium text-foreground">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cookieTypes.map((cookie, i) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 pr-4 type-primary-body-b2 text-foreground">{cookie.type}</td>
                                <td className="py-3 pr-4 type-primary-body-b2 text-muted-foreground">{cookie.purpose}</td>
                                <td className="py-3 type-primary-body-b2 text-muted-foreground">{cookie.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Button for Your Choices */}
                    {section.button && (
                      <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg type-primary-body-b2-medium text-foreground hover:bg-gray-50 transition">
                        <Settings size={16} className="text-primary" />
                        Manage Cookie Preferences
                      </button>
                    )}

                    {/* Contact */}
                    {section.contact && (
                      <div className="flex items-center gap-4 mt-3">
                        <a href="mailto:support@checkedup.com" className="flex items-center gap-2 text-primary hover:underline">
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
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
