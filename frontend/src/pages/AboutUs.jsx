import React from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import Button from '@/components/ui/Button'
// Checked Up — About page
// Fonts: Plus Jakarta Sans (display) + Inter (body) — load these in index.html:
// <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
const values = [
  {
    title: 'Clarity over jargon',
    body: "Every report comes with plain-language explanations, not just numbers on a page. You shouldn't need a medical degree to understand your own bloodwork.",
    accent: 'blue',
  },
  {
    title: 'Speed you can plan around',
    body: "Home sample collection slots, real-time booking, and reports delivered the moment they're ready — usually well inside 24 hours.",
    accent: 'yellow',
  },
  {
    title: 'Labs held to a standard',
    body: 'We partner only with NABL-accredited diagnostic labs and audit turnaround times and accuracy on an ongoing basis.',
    accent: 'green',
  },
]
const stats = [
  { value: '40+', label: 'cities served' },
  { value: '120+', label: 'tests & packages' },
  { value: '18k+', label: 'reports delivered' },
  { value: '<24h', label: 'avg. turnaround' },
]
const steps = [
  {
    n: '01',
    title: 'Book in minutes',
    body: 'Pick a test or package, choose a home-collection slot or a partner lab near you.',
  },
  {
    n: '02',
    title: 'Sample collection',
    body: 'A trained phlebotomist arrives at your slot, or you walk into a partner lab — your call.',
  },
  {
    n: '03',
    title: 'Get your report',
    body: 'Secure, encrypted PDF report in your dashboard as soon as the lab signs off, with a plain-language summary attached.',
  },
]
const accentMap = {
  blue: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', chip: '#DBEAFE' },
  yellow: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', chip: '#FEF3C7' },
  green: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', chip: '#DCFCE7' },
}
function ValueCard({ title, body, accent }) {
  const c = accentMap[accent]
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        padding: '28px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: c.chip,
          marginBottom: '18px',
        }}
      />
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: '17px',
          color: '#0F172A',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14.5px',
          lineHeight: 1.65,
          color: '#475569',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}
export default function AboutUs() {
  return (
    <PublicLayout>
      <div style={{ fontFamily: "'Inter', sans-serif", color: '#0F172A', background: '#FFFFFF' }}>
        {/* HERO */}
        <section
          style={{
            background: '#1E3A8A',
            padding: '96px 24px 80px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#93C5FD',
              background: 'rgba(147,197,253,0.12)',
              border: '1px solid rgba(147,197,253,0.3)',
              borderRadius: '999px',
              padding: '6px 16px',
              marginBottom: '24px',
            }}
          >
            About Checked Up
          </span>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '42px',
              lineHeight: 1.2,
              color: '#FFFFFF',
              maxWidth: '700px',
              margin: '0 auto 20px',
            }}
          >
            Diagnostics shouldn't feel like a chore
          </h1>
          <p
            style={{
              fontSize: '16.5px',
              lineHeight: 1.7,
              color: '#CBD5E1',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            Checked Up connects you to accredited labs for booking, home sample collection, and
            reports — all in one place, without the phone calls, paperwork, or waiting rooms.
          </p>
          {/* stat row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '40px',
              marginTop: '56px',
            }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '28px',
                    color: '#FFFFFF',
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* STORY */}
        <section style={{ padding: '80px 24px', maxWidth: '980px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '56px',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                }}
              >
                Why we started
              </span>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '28px',
                  color: '#0F172A',
                  margin: '12px 0 16px',
                  lineHeight: 1.3,
                }}
              >
                Built after one too many lost lab reports
              </h2>
              <p
                style={{ fontSize: '15px', lineHeight: 1.75, color: '#475569', margin: '0 0 14px' }}
              >
                We kept running into the same problem: booking a simple blood test meant calling
                three labs, comparing prices with no clear menu, and then chasing a PDF over
                WhatsApp days later. Health data that matters was scattered across group chats and
                paper slips.
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#475569', margin: 0 }}>
                Checked Up puts booking, collection, payment, and your report history behind one
                login — backed by labs we vet ourselves, not just the ones that pay for placement.
              </p>
            </div>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                padding: '32px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {steps.map((s) => (
                  <div key={s.n} style={{ display: 'flex', gap: '16px' }}>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '13px',
                        color: '#2563EB',
                        minWidth: '28px',
                      }}
                    >
                      {s.n}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: '14.5px',
                          color: '#0F172A',
                          marginBottom: '4px',
                        }}
                      >
                        {s.title}
                      </div>
                      <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#64748B' }}>
                        {s.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* VALUES */}
        <section style={{ background: '#F8FAFC', padding: '80px 24px' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                }}
              >
                What we hold ourselves to
              </span>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '28px',
                  color: '#0F172A',
                  margin: '12px 0 0',
                }}
              >
                Three things we don't compromise on
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}
            >
              {values.map((v) => (
                <ValueCard key={v.title} {...v} />
              ))}
            </div>
          </div>
        </section>
        {/* CTA */}
        <section style={{ padding: '72px 24px', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '26px',
              color: '#0F172A',
              margin: '0 0 12px',
            }}
          >
            Ready to book your first test?
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 28px' }}>
            Home collection is available in 40+ cities, with reports usually ready within a day.
          </p>
          <Button onClick={() => {}} className="font-semibold text-sm">
            Book a test
          </Button>
        </section>
      </div>
    </PublicLayout>
  )
}
