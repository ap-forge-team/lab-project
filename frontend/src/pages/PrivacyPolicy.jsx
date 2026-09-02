import React from 'react'
import {
  Calendar,
  Users,
  Share2,
  Lock,
  Shield,
  Eye,
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
    icon: Share2,
    title: 'How We Use Your Information',
    content: 'We use your information to provide and improve our services, process your bookings, communicate with you about your tests and reports, send important updates, and ensure a smooth user experience. We may also use your information for analytics, research, and to comply with legal obligations.',
  },
  {
    icon: Shield,
    title: 'Sharing Your Information',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in delivering our services, such as laboratory partners, logistics providers, and payment gateways, under strict confidentiality agreements.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
  },
  {
    icon: Eye,
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You can also opt out of receiving promotional communications from us at any time. To exercise your rights, please contact us using the details provided below.',
  },
  {
    icon: RefreshCw,
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
        <section className="enterprise-container py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block type-primary-label-l2-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                Privacy Policy
              </span>
              <h1 className="type-primary-heading-h0-mobile md:type-primary-heading-h0 text-foreground leading-tight mb-4">
                Privacy Policy
              </h1>
              <p className="type-primary-body-b1 text-muted-foreground leading-relaxed mb-6 max-w-lg">
                At Checked Up, we value your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                data when you use our website and services.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="type-primary-body-b2-medium text-foreground">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50">
                <img
                  src={privacyImg}
                  alt="Checked Up privacy policy"
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
                    <p className="type-primary-body-b2 text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                    {section.contact && (
                      <div className="flex items-center gap-4 mt-4">
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
