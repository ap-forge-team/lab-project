import React from 'react'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/ui/Logo'

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: ROUTES.HOME },
      { label: 'Tests', href: ROUTES.TESTS },
      { label: 'Packages', href: ROUTES.PACKAGES },
      { label: 'Book a test', href: ROUTES.BOOKING },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: ROUTES.ABOUT },
      { label: 'Partner labs', href: '/partners' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Track a report', href: '/reports' },
      { label: 'Cancellations & refunds', href: ROUTES.REFUND_POLICY },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Terms & Conditions', href: ROUTES.TERMS_OF_SERVICE },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
      { label: 'Terms of Service', href: ROUTES.TERMS_OF_SERVICE },
      { label: 'Refund Policy', href: ROUTES.REFUND_POLICY },
      { label: 'Cookie Policy', href: ROUTES.COOKIE_POLICY },
    ],
  },
]

const socials = [
  { label: 'IG', href: 'https://instagram.com' },
  { label: 'IN', href: 'https://linkedin.com' },
  { label: 'X', href: 'https://twitter.com' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-tertiary">
      <div className="enterprise-container pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8">
          {/* Brand column */}
          <div>
            <Logo variant="white" className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mb-6">
              Book lab tests, arrange home sample collection, and get reports from accredited labs —
              all in one place.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-8 h-8 border border-white/15 rounded-md flex items-center justify-center text-[10px] font-medium text-white/50 hover:text-white/80 hover:border-white/30 transition"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <div className="text-sm font-semibold text-white mb-4">
                {group.title}
              </div>
              <ul className="space-y-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-white transition block mb-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm text-muted-foreground">
            © {year} Checked Up. All rights reserved.
          </span>
          <span className="text-sm text-muted-foreground">
            Reports delivered from NABL-accredited labs only.
          </span>
        </div>
      </div>
    </footer>
  )
}
