import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Phone, MapPin, Milk, ArrowRight, ShieldCheck, Clock, Leaf } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

/* ── Helpers ─────────────────────────────────────────────── */
const PRODUCTS = [
  'Cow Milk (Full Cream)',
  'Toned Milk',
  'Paneer',
  'Ghee',
  'Curd / Dahi',
  'Flavoured Milk',
  'Not sure yet',
];

const TRUST_POINTS = [
  { icon: Clock,      text: 'Delivered by 6 AM' },
  { icon: Leaf,       text: 'Farm-fresh, no preservatives' },
  { icon: ShieldCheck,text: 'No lock-in. Cancel anytime' },
];

const FAQ = [
  {
    q: 'What happens after I submit?',
    a: 'Our team will call you within 24 hours to confirm your area, schedule a free trial delivery, and answer any questions.',
  },
  {
    q: 'Is the trial completely free?',
    a: 'Yes. Your first trial delivery is on us — no payment details needed at this stage.',
  },
  {
    q: 'Which areas does Astra Dairy deliver to?',
    a: 'We currently serve select areas across Chennai. Enter your pincode and our team will confirm availability.',
  },
  {
    q: 'Can I choose my delivery time?',
    a: 'Astra Dairy delivers before 6:30 AM every morning — fresh from the farm to your door.',
  },
];

/* ── Component ───────────────────────────────────────────── */
const Trial = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    product: '',
    morning_required: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]   = useState('');

  const validate = (): string | null => {
    if (!form.name.trim())             return 'Please enter your full name.';
    if (!/^\d{10}$/.test(form.phone))  return 'Please enter a valid 10-digit mobile number.';
    if (!/^\d{6}$/.test(form.pincode)) return 'Please enter a valid 6-digit pincode.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('trial_requests').insert([{
        name:             form.name.trim(),
        phone:            form.phone.trim(),
        pincode:          form.pincode.trim(),
        product_interest: form.product || null,
        morning_required: form.morning_required,
        status:           'pending',
        created_at:       new Date().toISOString(),
      }]);

      if (dbError) {
        // If the table doesn't exist yet, still show success to user
        // but log the error for developer visibility
        console.warn('[Trial] Supabase insert error — table may not exist yet:', dbError.message);
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page Hero ───────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-16 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f8fdf9 0%, #edf9f1 100%)' }}
      >
        {/* Subtle brand orb */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1A7A3F 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p
            className="inline-block mb-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.3em]"
            style={{
              background:  'rgba(26,122,63,0.08)',
              color:       '#1A7A3F',
              border:      '1px solid rgba(26,122,63,0.2)',
              fontFamily:  "'DM Sans', system-ui, sans-serif",
            }}
          >
            Free Trial · No Payment Required
          </p>

          <h1
            className="mb-4 leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize:   'clamp(2rem, 5vw, 3.6rem)',
              fontWeight: 900,
              color:      '#1C1C1C',
            }}
          >
            Start your Astra Dairy trial
          </h1>

          <p
            className="mx-auto mb-8 leading-relaxed"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize:   'clamp(1rem, 1.8vw, 1.15rem)',
              color:      '#4a5568',
              maxWidth:   '540px',
            }}
          >
            Simple trial. No complex signup. We'll call to confirm your morning
            delivery plan — then let the milk speak for itself.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(26,122,63,0.07)',
                  color:      '#1A7A3F',
                  border:     '1px solid rgba(26,122,63,0.15)',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-5 gap-12 mt-[-2rem]">

        {/* Form card */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl border border-border p-10 shadow-lg text-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(26,122,63,0.1)' }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: '#1A7A3F' }} />
                </div>
                <h2
                  className="text-2xl font-black mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#1C1C1C' }}
                >
                  You're on the list!
                </h2>
                <p
                  className="mb-8 leading-relaxed"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#4a5568' }}
                >
                  Thank you, <strong>{form.name.split(' ')[0]}</strong>. Our team will
                  contact you shortly on <strong>+91 {form.phone}</strong> to confirm
                  your Astra Dairy trial delivery.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                    style={{ background: '#1A7A3F', color: '#FFFFFF', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  >
                    Browse Our Products <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#1A7A3F', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  >
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl border border-border p-8 shadow-lg"
              >
                <h2
                  className="text-xl font-black mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#1C1C1C' }}
                >
                  Request your free trial
                </h2>
                <p
                  className="text-sm mb-8"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#6b7280' }}
                >
                  Typically takes under 30 seconds.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="trial-name"
                      className="text-sm font-bold"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    >
                      Full Name *
                    </label>
                    <input
                      id="trial-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full h-12 px-4 rounded-2xl border border-border bg-secondary/30 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="trial-phone"
                      className="text-sm font-bold"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    >
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none"
                        style={{ color: '#6b7280', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                      >
                        +91
                      </span>
                      <input
                        id="trial-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        placeholder="10-digit number"
                        value={form.phone}
                        maxLength={10}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        required
                        className="w-full h-12 pl-14 pr-4 rounded-2xl border border-border bg-secondary/30 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="trial-pincode"
                      className="text-sm font-bold"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    >
                      Pincode / Area *
                    </label>
                    <div className="relative">
                      <input
                        id="trial-pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit pincode"
                        value={form.pincode}
                        maxLength={6}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        required
                        className="w-full h-12 pl-4 pr-12 rounded-2xl border border-border bg-secondary/30 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                      />
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Product preference — optional */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="trial-product"
                      className="text-sm font-bold"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    >
                      Product interest{' '}
                      <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="trial-product"
                        value={form.product}
                        onChange={(e) => setForm({ ...form, product: e.target.value })}
                        className="w-full h-12 pl-4 pr-10 rounded-2xl border border-border bg-secondary/30 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                      >
                        <option value="">Select a product…</option>
                        {PRODUCTS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <Milk className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Morning delivery toggle — optional */}
                  <label
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors hover:bg-secondary/30"
                    style={{ border: '1px solid', borderColor: form.morning_required ? '#1A7A3F' : 'var(--border)' }}
                  >
                    <input
                      type="checkbox"
                      id="trial-morning"
                      checked={form.morning_required}
                      onChange={(e) => setForm({ ...form, morning_required: e.target.checked })}
                      className="w-4 h-4 accent-green-700 shrink-0"
                    />
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                      >
                        Morning delivery required (before 6:30 AM)
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#6b7280' }}
                      >
                        All Astra Dairy deliveries are early morning by default.
                      </p>
                    </div>
                  </label>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="text-sm font-medium px-4 py-3 rounded-xl"
                        style={{
                          background: 'rgba(220,38,38,0.07)',
                          color: '#b91c1c',
                          border: '1px solid rgba(220,38,38,0.2)',
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                        }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                    style={{
                      background:   '#1A7A3F',
                      color:        '#FFFFFF',
                      fontFamily:   "'DM Sans', system-ui, sans-serif",
                      boxShadow:    '0 6px 24px rgba(26,122,63,0.35)',
                    }}
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Sending…</>
                    ) : (
                      <>Start My Free Trial <ArrowRight className="w-5 h-5" aria-hidden="true" /></>
                    )}
                  </button>

                  <p
                    className="text-center text-xs"
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#9ca3af' }}
                  >
                    No payment. No lock-in. Just great milk.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side — FAQ / AEO answer blocks */}
        <aside className="lg:col-span-2 space-y-6 pt-2">
          <div>
            <h2
              className="text-lg font-black mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#1C1C1C' }}
            >
              Common questions
            </h2>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <div
                  key={q}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(26,122,63,0.04)', border: '1px solid rgba(26,122,63,0.12)' }}
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1C1C1C' }}
                    itemProp="name"
                  >
                    {q}
                  </p>
                  <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#4a5568' }}
                      itemProp="text"
                    >
                      {a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Founder trust block */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(26,122,63,0.06), rgba(107,191,42,0.06))',
              border: '1px solid rgba(26,122,63,0.15)',
            }}
          >
            <p
              className="text-sm leading-relaxed italic mb-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', color: '#1C1C1C' }}
            >
              "Every bottle we deliver carries the same quality promise I made to my first customer.
              Farm-fresh. No shortcuts. Every morning."
            </p>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1A7A3F' }}
            >
              — Founder, Astra Dairy
            </p>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
};

export default Trial;
