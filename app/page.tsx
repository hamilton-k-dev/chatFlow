import Link from 'next/link';

const features = [
  { icon: 'ri-message-3-fill',      color: 'from-indigo-500 to-violet-600', title: 'Real-time messaging',  desc: 'Instant delivery via WebSocket. No refresh, no delay.' },
  { icon: 'ri-group-fill',           color: 'from-sky-500 to-blue-600',      title: 'Group chats',          desc: 'Create groups, manage members, and assign admins.' },
  { icon: 'ri-mic-fill',             color: 'from-rose-500 to-pink-600',     title: 'Voice messages',       desc: 'Record and send audio clips with a live waveform.' },
  { icon: 'ri-image-fill',           color: 'from-amber-500 to-orange-600',  title: 'Image sharing',        desc: 'Send images with full-screen preview and caption.' },
  { icon: 'ri-reply-fill',           color: 'from-emerald-500 to-teal-600',  title: 'Message replies',      desc: 'Quote any message with a contextual reply thread.' },
  { icon: 'ri-search-2-line',        color: 'from-violet-500 to-purple-600', title: 'Global search',        desc: 'Search across all conversations and groups at once.' },
  { icon: 'ri-delete-bin-5-fill',    color: 'from-red-500 to-rose-600',      title: 'Delete messages',      desc: 'Soft-delete with a "Message deleted" placeholder.' },
  { icon: 'ri-forbid-fill',          color: 'from-slate-500 to-slate-700',   title: 'Block & unblock',      desc: 'Blocks messages, typing, and online status — both ways.' },
  { icon: 'ri-moon-fill',            color: 'from-indigo-400 to-slate-600',  title: 'Dark mode',            desc: 'Full dark/light theme toggle across every screen.' },
];

const demoAccounts = [
  { name: 'Sarah Mitchell',   email: 'sarah@example.com' },
  { name: 'James Carter',     email: 'james@example.com' },
  { name: 'Emily Rodriguez',  email: 'emily@example.com' },
  { name: 'Michael Chen',     email: 'michael@example.com' },
  { name: 'Olivia Thompson',  email: 'olivia@example.com' },
  { name: 'Daniel Park',      email: 'daniel@example.com' },
];

const stack = [
  { label: 'Next.js 16',     icon: 'ri-nextjs-fill',      color: 'text-black' },
  { label: 'Socket.IO 4',    icon: 'ri-wifi-line',         color: 'text-indigo-600' },
  { label: 'Prisma 7',       icon: 'ri-database-2-line',   color: 'text-emerald-600' },
  { label: 'Neon Postgres',  icon: 'ri-cloud-line',        color: 'text-sky-600' },
  { label: 'Better Auth',    icon: 'ri-shield-keyhole-line', color: 'text-violet-600' },
  { label: 'Tailwind CSS',   icon: 'ri-palette-line',      color: 'text-cyan-500' },
  { label: 'TypeScript',     icon: 'ri-code-s-slash-line', color: 'text-blue-600' },
  { label: 'Cloudinary',     icon: 'ri-cloud-upload-line', color: 'text-orange-500' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-[var(--font-geist-sans)]">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200">
              <i className="ri-chat-3-fill text-white text-sm" />
            </div>
            <span className="text-xl font-[var(--font-pacifico)] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ChatFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white transition-all shadow-sm shadow-indigo-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-28 px-6">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600 mb-6">
            <i className="ri-flashlight-fill" /> Real-time · Open source · Full-stack
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Chat that feels{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              instant
            </span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-10">
            ChatFlow is a production-ready real-time messaging app — private DMs, group chats, voice messages, search, and more. Built with Next.js 16 and Socket.IO.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50"
            >
              <i className="ri-play-circle-line mr-1.5" />Try the demo
            </Link>
            <a
              href="https://github.com/your-username/chatflow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm"
            >
              <i className="ri-github-fill mr-1.5" />View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold mb-3">Everything you need</h2>
            <p className="text-slate-500 text-base max-w-md mx-auto">A complete chat experience out of the box — no plugins, no extras.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-200 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${f.color} shadow-sm mb-4`}>
                  <i className={`${f.icon} text-white text-xl`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to try the demo ── */}
      <section id="demo" className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-600 mb-4">
              <i className="ri-flask-line" /> Demo
            </span>
            <h2 className="text-3xl font-extrabold mb-3">Try it live</h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              Six demo accounts are pre-loaded. Open the app in two different browsers (or a normal window + incognito) and log in as two different users to test real-time features.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { step: '1', icon: 'ri-user-line',       title: 'Pick an account',     desc: 'Choose any email from the table below.' },
              { step: '2', icon: 'ri-login-box-line',  title: 'Sign in',             desc: 'Use password123 for all demo accounts.' },
              { step: '3', icon: 'ri-chat-smile-2-line', title: 'Start chatting',    desc: 'Open another tab and log in as someone else.' },
            ].map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow">
                  {s.step}
                </span>
                <i className={`${s.icon} text-2xl text-indigo-500 mb-3 block`} />
                <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Accounts table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <i className="ri-group-line text-indigo-500" /> Demo accounts
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                password: <code className="font-mono text-indigo-600">password123</code>
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {demoAccounts.map((account, i) => (
                <div key={account.email} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${
                      ['from-indigo-400 to-violet-500','from-sky-400 to-blue-500','from-emerald-400 to-teal-500',
                       'from-rose-400 to-pink-500','from-amber-400 to-orange-500','from-fuchsia-400 to-purple-500'][i]
                    }`}>
                      {account.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{account.name}</span>
                  </div>
                  <span className="text-sm text-slate-500 font-mono">{account.email}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
              >
                <i className="ri-login-box-line" /> Sign in now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-3">Built with</h2>
          <p className="text-slate-500 text-base mb-12 max-w-md mx-auto">
            A modern, production-grade stack from frontend to database.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stack.map((s) => (
              <div key={s.label} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all flex flex-col items-center gap-2">
                <i className={`${s.icon} text-3xl ${s.color}`} />
                <span className="text-sm font-semibold text-slate-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-500 to-violet-600 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to start chatting?
          </h2>
          <p className="text-indigo-100 mb-8 text-base">
            Jump in instantly with a demo account — no setup required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-2xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <i className="ri-play-circle-line mr-1.5" />Try the demo
            </Link>
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-2xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <i className="ri-chat-3-fill text-white text-xs" />
            </div>
            <span className="text-sm font-[var(--font-pacifico)] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ChatFlow
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Built with Next.js 16 · Socket.IO · Prisma · Neon
          </p>
          <a
            href="https://github.com/your-username/chatflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <i className="ri-github-fill text-xl" />
          </a>
        </div>
      </footer>
    </div>
  );
}
