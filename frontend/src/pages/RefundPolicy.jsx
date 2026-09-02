import React from 'react'
import {
  Calendar,
  ClipboardCheck,
  FlaskConical,
  CreditCard,
  Home,
  AlertTriangle,
  XCircle,
  Headphones,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import refundImg from '@/assets/image/refund-policy-hero.png'

const refundApplicable = [
  {
    icon: ClipboardCheck,
    title: 'Order Cancellation',
    desc: 'You can cancel your test booking within 2 hours of placing the order and receive a full refund.',
    badge: 'Full Refund',
  },
  {
    icon: FlaskConical,
    title: 'Lab Unavailability',
    desc: 'If we are unable to process your test due to technical issues, lab downtime, or any other unavoidable circumstances, you will receive a full refund.',
    badge: 'Full Refund',
  },
  {
    icon: CreditCard,
    title: 'Payment Failure',
    desc: 'If the payment is deducted but the booking is not confirmed due to a system error, the full amount will be refunded to your original payment method.',
    badge: 'Full Refund',
  },
  {
    icon: Home,
    title: 'Home Sample Collection Issues',
    desc: 'If we are unable to collect your sample at the scheduled time and you choose to cancel, a full refund will be provided.',
    badge: 'Full Refund',
  },
  {
    icon: AlertTriangle,
    title: 'Incorrect Test Booked',
    desc: 'If you have booked the wrong test by mistake, you can cancel within 2 hours and get a full refund.',
    badge: 'Full Refund',
  },
]

const refundNotApplicable = [
  'Sample has been collected and is in process.',
  'Cancellation requested after 2 hours of booking.',
  'Reports have been generated or delivered.',
  'Discounted or promotional bookings may not be eligible for a refund.',
]

export default function RefundPolicy() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* HERO */}
        <section className="enterprise-container py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block type-primary-label-l2-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                Refund Policy
              </span>
              <h1 className="type-primary-heading-h0-mobile md:type-primary-heading-h0 text-foreground leading-tight mb-4">
                Refund Policy
              </h1>
              <p className="type-primary-body-b1 text-muted-foreground leading-relaxed mb-6 max-w-lg">
                At Checked Up, we aim for complete customer satisfaction.
                Please read our refund policy carefully to understand the
                conditions under which refunds are applicable.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="type-primary-body-b2-medium text-foreground">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50">
                <img
                  src={refundImg}
                  alt="Checked Up refund policy"
                  className="w-full h-[280px] md:h-[360px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* WHEN REFUNDS ARE APPLICABLE */}
        <section className="enterprise-container py-10 lg:py-14">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <h2 className="type-primary-heading-h1 text-foreground mb-2">
              When Are Refunds Applicable?
            </h2>
            <p className="type-primary-body-b2 text-muted-foreground mb-8">
              We offer refunds under the following circumstances:
            </p>
            <div className="flex flex-col gap-4">
              {refundApplicable.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="type-primary-heading-h3 text-foreground mb-1">
                        {index + 1}. {item.title}
                      </h3>
                      <p className="type-primary-body-b2 text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                        <CheckCircle size={16} />
                        {item.badge}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* WHEN REFUNDS ARE NOT APPLICABLE */}
        <section className="enterprise-container pb-10 lg:pb-14">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <h2 className="type-primary-heading-h1 text-foreground mb-2">
              When Refunds Are Not Applicable
            </h2>
            <p className="type-primary-body-b2 text-muted-foreground mb-8">
              Refunds will not be applicable in the following cases:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refundNotApplicable.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100"
                >
                  <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="type-primary-body-b2 text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEED HELP */}
        <section className="enterprise-container pb-10 lg:pb-14">
          <div className="bg-primary/5 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones size={26} className="text-primary" />
              </div>
              <div>
                <h3 className="type-primary-heading-h3 text-foreground mb-1">
                  Need Help?
                </h3>
                <p className="type-primary-body-b2 text-muted-foreground">
                  If you have any questions regarding refunds, feel free to
                  contact our support team. We're here to help!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <a href="mailto:support@checkedup.com" className="flex items-center gap-2 text-primary hover:underline">
                <Mail size={16} />
                <span className="type-primary-body-b2-medium">support@checkedup.com</span>
              </a>
              <a href="tel:18001234567" className="flex items-center gap-2 text-primary hover:underline">
                <Phone size={16} />
                <div>
                  <span className="type-primary-body-b2-medium block">1800-123-4567</span>
                  <span className="type-primary-body-b3 text-muted-foreground">(7:00 AM - 10:00 PM)</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
