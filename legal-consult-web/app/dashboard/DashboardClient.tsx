'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Session } from '@/lib/supabase/types'

interface DashboardClientProps {
  user: User
  profile: Profile | null
  sessions: Session[]
}

const LEGAL_DOMAIN_COLORS: Record<string, string> = {
  civil: 'bg-blue-100 text-blue-700',
  criminal: 'bg-red-100 text-red-700',
  land: 'bg-green-100 text-green-700',
  labor: 'bg-yellow-100 text-yellow-700',
  commercial: 'bg-purple-100 text-purple-700',
  family: 'bg-pink-100 text-pink-700',
  intellectual: 'bg-indigo-100 text-indigo-700',
  tax: 'bg-orange-100 text-orange-700',
  administrative: 'bg-gray-100 text-gray-700',
  insurance: 'bg-cyan-100 text-cyan-700',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardClient({ user, profile, sessions }: DashboardClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isLawyer = profile?.role === 'lawyer'

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
              </svg>
              <span className="font-serif font-bold text-xl">Lexima</span>
            </Link>
          </div>
          <nav className="px-3 space-y-1">
            {[
              { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { href: '/sessions', label: 'Sessions', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              { href: '/chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              { href: '/search', label: 'Legal Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { href: '/ai', label: 'AI Assistant', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-gray-100 hover:text-primary transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}

            {isLawyer && (
              <>
                <div className="py-4">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider px-3">Admin</div>
                </div>
                {[
                  { href: '/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  { href: '/audit', label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-gray-100 hover:text-primary transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                ))}
              </>
            )}

            <div className="pt-4">
              <div className="border-t" />
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-gray-100 hover:text-primary transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search consultations, documents..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-serif font-bold text-primary">
                Welcome back, {profile?.full_name || 'User'}
              </h1>
              <p className="text-muted mt-1">Here's an overview of your legal consultation activity.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Active Sessions', value: isLawyer ? '12' : '3' },
                { label: 'Completed', value: isLawyer ? '48' : '15' },
                { label: isLawyer ? 'Earnings' : 'Pending', value: isLawyer ? '$2,450' : '4' },
                { label: 'Satisfaction', value: '98%' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border p-6">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Recent Sessions */}
              <div className="col-span-2 bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Sessions</h3>
                  <Link href="/sessions" className="text-sm text-accent hover:underline">View All</Link>
                </div>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/chat/${session.id}`}
                        className="block p-4 rounded-lg border hover:border-accent hover:shadow-sm transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEGAL_DOMAIN_COLORS[session.legal_domain] || 'bg-gray-100 text-gray-700'}`}>
                            {session.legal_domain}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[session.status] || 'bg-gray-100 text-gray-700'}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="font-medium">{session.title}</div>
                        <div className="text-sm text-muted mt-1">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No sessions yet</p>
                      <Link href="/sessions" className="text-accent hover:underline text-sm mt-2 inline-block">
                        Start a new consultation
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/sessions"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Consultation
                  </Link>
                  <Link
                    href="/search"
                    className="flex items-center justify-center gap-2 w-full py-3 border border-border rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Legal Docs
                  </Link>
                  <Link
                    href="/ai"
                    className="flex items-center justify-center gap-2 w-full py-3 border border-border rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Assistant
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal Domain Stats */}
            <div className="mt-6 bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Consultation by Domain</h3>
              <div className="grid grid-cols-5 gap-4">
                {['Civil', 'Criminal', 'Land', 'Labor', 'Commercial'].map((domain) => (
                  <div key={domain} className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${LEGAL_DOMAIN_COLORS[domain.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                      {domain}
                    </div>
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 20 + 5)}</div>
                    <div className="text-sm text-muted">sessions</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
