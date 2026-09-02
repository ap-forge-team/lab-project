import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, Home, Lock, MapPin, Phone, Mail, Clock,
  Users, ClipboardCheck, MapPinIcon, Star, ChevronRight
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/ui/Logo'

const companyLinks = [
  { label: 'About Us', href: ROUTES.ABOUT },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
  { label: 'Media & News', href: '/media' },
  { label: 'Contact Us', href: ROUTES.CONTACT },
]

const testLinks = [
  { label: 'All Tests', href: ROUTES.TESTS },
  { label: 'Blood Tests', href: `${ROUTES.TESTS}?category=Blood` },
  { label: 'Health Checkups', href: `${ROUTES.TESTS}?category=Health+Checkup` },
  { label: 'Home Collection', href: `${ROUTES.TESTS}?collection=home` },
  { label: 'Popular Tests', href: ROUTES.TESTS },
  { label: 'Test by Category', href: ROUTES.TESTS },
]

const supportLinks = [
  { label: 'Help Center', href: '/help' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Sample Collection Guide', href: '/guide' },
  { label: 'Reports Guide', href: '/reports-guide' },
  { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
  { label: 'Terms & Conditions', href: ROUTES.TERMS_OF_SERVICE },
]

const features = [
  { icon: ShieldCheck, title: 'NABL Accredited Labs', desc: 'Quality you can trust', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: Home, title: 'Home Sample Collection', desc: 'Safe & convenient', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { icon: Lock, title: '100% Secure & Private', desc: 'Your data is always safe', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
]

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Customers', iconColor: 'text-blue-600' },
  { icon: ClipboardCheck, value: '2,500+', label: 'Tests & Profiles', iconColor: 'text-green-600' },
  { icon: MapPinIcon, value: '150+', label: 'Cities Covered', iconColor: 'text-primary' },
  { icon: Star, value: '98%', label: 'Customer Satisfaction', iconColor: 'text-amber-500' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-border">
      <div className="enterprise-container pt-12 pb-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] gap-8 mb-10">
          {/* Brand Column */}
          <div>
            <Logo className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mb-6">
              Your trusted partner for accurate diagnostics and better health. Book tests, get reports and take charge of your health today.
            </p>
            <div className="space-y-3">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${feat.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <feat.icon size={18} className={feat.iconColor} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{feat.title}</p>
                    <p className="text-[11px] text-muted-foreground">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-2"
                  >
                    <ChevronRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tests Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">
              Tests
            </h4>
            <ul className="space-y-2.5">
              {testLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-2"
                  >
                    <ChevronRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-2"
                  >
                    <ChevronRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">+91 12345 67890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">support@checkedup.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Mon - Sun: 8:00 AM - 8:00 PM</span>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-xs font-semibold text-foreground mb-2">We Accept</p>
              <div className="flex gap-2 flex-wrap">
                {['VISA', 'MC', 'UPI', 'Paytm', 'PhonePe'].map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-muted-foreground"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Stay Updated with Health Tips</p>
                <p className="text-sm font-bold text-foreground">& Exclusive Offers</p>
              </div>
            </div>
            <p className="text-xs text-muted-hidden flex-1 hidden md:block">
              Subscribe to our newsletter and never miss important health updates.
            </p>
            <div className="flex-1 w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition">
                  Subscribe
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">
            © {year} Checked Up Lab Tests. All rights reserved.
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to={ROUTES.PRIVACY_POLICY} className="text-xs text-muted-foreground hover:text-primary transition">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link to={ROUTES.TERMS_OF_SERVICE} className="text-xs text-muted-foreground hover:text-primary transition">
              Terms of Service
            </Link>
            <span className="text-gray-300">|</span>
            <Link to={ROUTES.REFUND_POLICY} className="text-xs text-muted-foreground hover:text-primary transition">
              Refund Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link to={ROUTES.COOKIE_POLICY} className="text-xs text-muted-foreground hover:text-primary transition">
              Cookie Policy
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {['FB', 'IG', 'IN', 'X'].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-muted-foreground hover:bg-primary hover:text-white transition"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
