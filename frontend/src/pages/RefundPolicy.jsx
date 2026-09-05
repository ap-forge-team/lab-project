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
        <section className="enterprise-container py-10 ">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                Refund Policy
              </span>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-gray-900 leading-tight mb-4">
                Refund Policy
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
                At Checked Up, we aim for complete customer satisfaction.
                Please read our refund policy carefully to understand the
                conditions under which refunds are applicable.
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Last Updated: 12 May 2024</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50 p-6">
                <img
                  src={refundImg}
                  alt="Checked Up refund policy"
                  className="w-full h-[280px] md:h-[340px] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* WHEN REFUNDS ARE APPLICABLE */}
        <section className="enterprise-container pb-10">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">
              When Are Refunds Applicable?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We offer refunds under the following circumstances:
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {refundApplicable.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-5 p-6 ${index < refundApplicable.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-blue-600 lg:hidden" />
                      <Icon size={28} className="text-blue-600 hidden lg:block" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">
                        {index + 1}. {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                        <CheckCircle size={18} />
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
        <section className="enterprise-container pb-10">
          <div className="bg-red-50 rounded-2xl p-6 lg:p-8">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">
              When Refunds Are Not Applicable
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Refunds will not be applicable in the following cases:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refundNotApplicable.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-md bg-white"
                >
                  <div className="w-10 h-10 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle size={22} className="text-red-500" />
                  </div>
                  <span className="text-sm text-gray-700 pt-2">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEED HELP */}
        <section className="enterprise-container pb-10">
          <div className="bg-blue-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 rounded-full border border-blue-100 bg-white flex items-center justify-center flex-shrink-0">
                <Headphones size={28} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-500">
                  If you have any questions regarding refunds, feel free to
                  contact our support team. We're here to help!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <a href="mailto:support@checkedup.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                <Mail size={16} />
                <span className="text-sm font-medium">support@checkedup.com</span>
              </a>
              <div className="w-px h-8 bg-gray-300" />
              <a href="tel:18001234567" className="flex items-center gap-2 text-blue-600 hover:underline">
                <Phone size={16} />
                <div>
                  <span className="text-sm font-medium block">1800-123-4567</span>
                  <span className="text-xs text-gray-500">(7:00 AM - 10:00 PM)</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
