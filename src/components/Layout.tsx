import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, HeartHandshake, House, NotebookPen, Plus, Wind } from 'lucide-react'
import { closeDialog, openDialog, useOpenDialog } from '../lib/ui'
import { CheckInDialog } from './CheckInDialog'
import { CrisisLines } from './CrisisNote'
import { Dialog } from './Dialog'
import { Logo } from './Logo'
import { Toaster } from './Toaster'

const NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/breathe', label: 'Breathe', icon: Wind },
  { to: '/codex', label: 'Codex', icon: BookOpen },
]

const topLink = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center px-3 text-[15px] font-medium transition-colors ${
    isActive ? 'text-ink underline decoration-sage decoration-2 underline-offset-8' : 'text-muted hover:text-ink'
  }`

const tabLink = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${isActive ? 'text-sage' : 'text-muted'}`

export function Layout() {
  const { pathname } = useLocation()
  const dialog = useOpenDialog()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <Logo />
            Second Look
          </NavLink>
          <nav className="hidden items-center md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={topLink}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-text text-muted hover:text-ink" onClick={() => openDialog('crisis')}>
              <HeartHandshake className="size-5 text-sage" aria-hidden="true" />
              Support
            </button>
            <NavLink to="/studio" className="btn-primary hidden min-h-10 px-4 md:inline-flex">
              <Plus className="size-4" aria-hidden="true" />
              New reframe
            </NavLink>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 sm:px-6 sm:pt-10 md:pb-16">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-muted">
          <p>Everything you write stays in this browser. Nothing is sent anywhere.</p>
          <p>
            A self-help tool, not a replacement for professional care.{' '}
            <button type="button" className="underline underline-offset-4 hover:text-ink" onClick={() => openDialog('crisis')}>
              Need support now?
            </button>
          </p>
        </div>
      </footer>

      {/* Thumb-reachable tab bar on phones, with the main action in the middle. */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
        {NAV.slice(0, 2).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={tabLink}>
            <n.icon className="size-5" aria-hidden="true" />
            {n.label}
          </NavLink>
        ))}
        <NavLink to="/studio" className={tabLink}>
          <span className="grid size-10 place-items-center rounded-full bg-sage text-on-sage">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="sr-only">New reframe</span>
        </NavLink>
        {NAV.slice(2).map((n) => (
          <NavLink key={n.to} to={n.to} className={tabLink}>
            <n.icon className="size-5" aria-hidden="true" />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <Dialog
        open={dialog.name === 'crisis'}
        onClose={closeDialog}
        title="Support, right now"
        subtitle="Free, confidential, and available 24/7."
        icon={<HeartHandshake className="size-5" />}
        footer={
          <button type="button" className="btn-primary" onClick={closeDialog}>
            Back to Second Look
          </button>
        }
      >
        <p className="mb-4 text-[15px] text-muted">
          If you are in danger, thinking about hurting yourself, or just can&apos;t carry this alone right now, please contact one of
          these. If you are in immediate danger, call your local emergency number.
        </p>
        <CrisisLines />
      </Dialog>

      <CheckInDialog open={dialog.name === 'checkin'} initialMood={dialog.mood} />
      <Toaster />
    </div>
  )
}
