'use client'

import { useState, lazy, Suspense } from 'react'
import Link from 'next/link'

const LEGAL_DOMAINS = [
  { value: 'civil', label: 'Civil Law' },
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'land', label: 'Land Law' },
  { value: 'labor', label: 'Labor Law' },
  { value: 'commercial', label: 'Commercial Law' },
  { value: 'family', label: 'Family Law' },
  { value: 'intellectual', label: 'Intellectual Property' },
  { value: 'tax', label: 'Tax Law' },
  { value: 'administrative', label: 'Administrative Law' },
  { value: 'insurance', label: 'Insurance Law' },
]

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [isLoading, setIsLoading] = useState(false)

  // Lazy load Supabase client to avoid SSR issues
  const getSupabase = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    return createClient()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const supabase = await getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setIsLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const supabase = await getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) {
      alert(error.message)
    } else if (data.user) {
      window.location.href = '/dashboard'
    }
    setIsLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setIsLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) {
      alert(error.message)
    } else if (data.user) {
      window.location.href = '/dashboard'
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
              </svg>
              <span className="font-serif font-bold text-xl text-primary">Lexima</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm text-muted hover:text-primary transition">Solutions</a>
              <a href="#" className="text-sm text-muted hover:text-primary transition">Find Attorney</a>
              <a href="#" className="text-sm text-muted hover:text-primary transition">Resources</a>
              <a href="#" className="text-sm text-muted hover:text-primary transition">Enterprise</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 text-sm text-muted hover:text-primary transition"
              >
                Log in
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark transition"
              >
                Start Consultation
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                AI-POWERED LEGAL INTELLIGENCE
              </div>
              <h1 className="text-4xl lg:text-6xl font-serif font-bold text-primary leading-tight">
                Legal clarity for the{' '}
                <span className="text-accent">modern world.</span>
              </h1>
              <p className="text-lg text-muted max-w-xl">
                Access top-tier legal consultation instantly. Our platform combines expert attorneys with neural analysis to provide unmatched precision in legal advice.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowRegister(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition font-medium"
                >
                  Book a Consultation
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="px-6 py-3 border border-border rounded-lg hover:bg-white transition font-medium">
                  View Case Studies
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {['JD', 'AK', 'MC'].map((initials) => (
                    <div
                      key={initials}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium border-2 border-white"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold">500+ Qualified Attorneys</div>
                  <div className="text-sm text-muted">Available 24/7 for urgent consultations</div>
                </div>
              </div>
            </div>

            {/* Right - Quick Analysis Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-lg">Quick Analysis</h3>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Legal Domain</label>
                  <select className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                    <option value="">Select a domain...</option>
                    {LEGAL_DOMAINS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your case..."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
                >
                  Match with Expert
                </button>
              </form>
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t text-sm text-muted">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Fully Encrypted
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx={12} cy={12} r={10} />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Avg. wait: 4 mins
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '98%', label: 'Success Rate' },
              { value: '240k+', label: 'Cases Resolved' },
              { value: '<12m', label: 'Avg. Response' },
              { value: '50+', label: 'Global Markets' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-serif font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-primary">
                Redefining legal accessibility.
              </h2>
              <p className="text-muted mt-4 max-w-2xl">
                Lexima utilizes state-of-the-art technology to bridge the gap between complex legal needs and elite representation.
              </p>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-accent hover:underline">
              Explore Methodology
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart Intake',
                description: 'Our AI analyzes your legal requirements instantly to categorize and prioritize your consultation request.',
                features: ['NLP Document Scanning', 'Instant Conflict Checks'],
              },
              {
                title: 'Elite Network',
                description: 'Connect with a hand-picked network of attorneys from the world\'s most prestigious firms and practices.',
                features: ['15+ Years Avg. Experience', 'Verified Bar Credentials'],
              },
              {
                title: 'Case Predictor',
                description: 'Gain data-driven insights into potential case outcomes based on historical court data and legal precedents.',
                features: ['Data Visualization', 'Probabilistic Modeling'],
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl border ${i === 1 ? 'bg-primary text-white' : 'bg-white'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    {i === 0 && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />}
                    {i === 1 && <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />}
                    {i === 2 && <path d="M18 20V10M12 20V4M6 20v-6" />}
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">{feature.title}</h3>
                <p className={`text-sm ${i === 1 ? 'text-white/80' : 'text-muted'}`}>
                  {feature.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {feature.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
            Ready to secure your interests?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Join over 10,000 businesses and individuals who trust Lexima for their legal journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRegister(true)}
              className="px-8 py-4 bg-white text-accent rounded-lg hover:bg-white/90 transition font-semibold"
            >
              Start Your First Session
            </button>
            <button className="px-8 py-4 bg-transparent text-white border border-white/30 rounded-lg hover:bg-white/10 transition font-semibold">
              Book an Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
                </svg>
                <span className="font-serif font-bold text-xl">Lexima</span>
              </div>
              <p className="text-white/60 text-sm max-w-xs">
                The future of legal consultation is here. Bridging the gap between law and technology for global enterprises.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition">Case Management</a></li>
                <li><a href="#" className="hover:text-white transition">AI Document Review</a></li>
                <li><a href="#" className="hover:text-white transition">Attorney Network</a></li>
                <li><a href="#" className="hover:text-white transition">Billing & Payments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Legal Board</a></li>
                <li><a href="#" className="hover:text-white transition">Press & Media</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Safety & Ethics</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">2024 Lexima Legal Technologies. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Regulatory Information</a>
              <a href="#" className="hover:text-white transition">Ethical AI Commitment</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-2xl">Welcome Back</h3>
              <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition font-medium disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-2xl">Create Account</h3>
              <button onClick={() => setShowRegister(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">I am a...</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                >
                  <option value="customer">Customer - Seeking legal advice</option>
                  <option value="lawyer">Lawyer - Providing legal services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="Create a password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition font-medium disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
