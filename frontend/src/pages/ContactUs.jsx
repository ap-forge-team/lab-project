import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  User,
  ChevronDown,
  Headphones,
  CheckCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import contactImg from '@/assets/image/contact-us-hero.png';

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    desc: 'Our support team is available from 7:00 AM to 10:00 PM',
    detail: '+91 98765 43210',
    sub: 'Toll Free: 1800-123-4567',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    desc: 'We usually respond within 24 hours',
    detail: 'support@checkedup.com',
    sub: null,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    desc: 'Chat with us on WhatsApp for quick assistance',
    detail: '+91 98765 43210',
    sub: null,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    desc: 'Checked Up Diagnostic Labs\n123 Health Street, City Center\nBangalore, Karnataka \u2013 560001',
    detail: 'View on Map',
    sub: null,
    color: 'bg-blue-50 text-blue-600',
    isLink: true,
  },
];

const faqs = [
  {
    q: 'How can I book a test?',
    a: 'You can book a test by browsing our test catalog, selecting the tests you need, and scheduling a home collection or lab visit. The entire process takes just a few minutes.',
  },
  {
    q: 'How will I receive my report?',
    a: 'Reports are delivered digitally to your registered email and can also be accessed from your dashboard on our platform. Most reports are available within 24-48 hours.',
  },
  {
    q: 'Do you provide home sample collection?',
    a: 'Yes, we offer free home sample collection for orders above \u20b9999. Our trained phlebotomists visit your location at a scheduled time for a safe and comfortable experience.',
  },
  {
    q: 'What if I need to reschedule my appointment?',
    a: 'You can reschedule your appointment up to 2 hours before the scheduled time through your dashboard or by contacting our support team.',
  },
];

const subjects = [
  'General Inquiry',
  'Book a Test',
  'Report Issue',
  'Billing Support',
  'Technical Support',
  'Partnership',
  'Feedback',
];

export default function ContactUs() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* HERO */}
        <section className="enterprise-container py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2">
              <span className="inline-block type-primary-label-l2-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-5">
                Contact Us
              </span>
              <h1 className="type-primary-heading-h0-mobile md:type-primary-heading-h0 text-foreground leading-tight mb-5">
                We're Here to <span className="text-primary">Help You</span>
              </h1>
              <p className="type-primary-body-b1 text-muted-foreground leading-relaxed mb-7 max-w-lg">
                Have questions or need assistance? Our support team is ready
                to help you. Reach out to us through any of the channels
                below.
              </p>
              <div className="flex flex-col gap-3">
                {['Quick Response', 'Expert Support', 'Patient First Approach'].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle size={18} className="text-primary" />
                      <span className="type-primary-body-b2-medium text-foreground">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden bg-blue-50">
                <img
                  src={contactImg}
                  alt="Checked Up support team"
                  className="w-full h-[280px] md:h-[360px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FORM + CONTACT INFO */}
        <section className="enterprise-container py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Get in Touch Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
              <h2 className="type-primary-heading-h1 text-foreground mb-6">
                Get in Touch
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="" disabled>
                      Subject
                    </option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg text-sm font-semibold transition"
                >
                  <Send size={16} />
                  Send Message
                </button>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Shield size={12} />
                  Your information is safe with us. We never share your data.
                </p>
              </form>
            </div>

            {/* Other Ways to Contact Us */}
            <div>
              <h2 className="type-primary-heading-h1 text-foreground mb-6">
                Other Ways to Contact Us
              </h2>
              <div className="flex flex-col gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.title}
                      className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition"
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="type-primary-heading-h3 text-foreground mb-1">
                          {method.title}
                        </h3>
                        <p className="type-primary-body-b3 text-muted-foreground whitespace-pre-line leading-relaxed">
                          {method.desc}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {method.isLink ? (
                          <span className="type-primary-body-b2-medium text-primary cursor-pointer hover:underline flex items-center gap-1">
                            {method.detail} <ArrowRight size={14} />
                          </span>
                        ) : (
                          <span className="type-primary-body-b2-medium text-primary">
                            {method.detail}
                          </span>
                        )}
                        {method.sub && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {method.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-14 lg:py-20">
          <div className="enterprise-container">
            <div className="text-center mb-10">
              <h2 className="type-primary-heading-h1 text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <p className="type-primary-body-b2 text-muted-foreground">
                Find quick answers to common questions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                  >
                    <span className="type-primary-body-b2-medium text-foreground pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground flex-shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5">
                      <p className="type-primary-body-b3 text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* STILL HAVE QUESTIONS */}
            <div className="mt-10 bg-primary/5 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Headphones size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="type-primary-heading-h3 text-foreground">
                    Still have questions?
                  </h3>
                  <p className="type-primary-body-b3 text-muted-foreground">
                    Our support team is here to help you with anything you
                    need.
                  </p>
                </div>
              </div>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition flex-shrink-0"
              >
                <Phone size={16} />
                Call Us Now
              </a>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
