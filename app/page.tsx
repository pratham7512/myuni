export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="grid md:grid-cols-2">
        <div className="relative flex items-center bg-black text-white px-10 py-24 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_0%_0%,rgba(37,99,235,0.15),transparent),radial-gradient(400px_160px_at_100%_20%,rgba(37,99,235,0.12),transparent)]" />
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05]">MyUni: Learn, Code, Interview</h1>
            <p className="mt-5 text-zinc-300 text-lg">Join classrooms, solve curated DSA problems, get instant verdicts, and run mock interviews — all in one modern, fast experience.</p>
            <div className="mt-10 flex gap-4">
              <a href="/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-5">Sign in</a>
              <a href="/auth?mode=signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold border border-white/20 px-5 h-10 hover:border-white/40">Create account</a>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-primary text-primary-foreground px-10 py-20">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold">Built for students and teachers</h2>
            <p className="mt-3 opacity-90">We emphasize clarity, speed, and productive flows with a distinct dark/blue aesthetic.</p>
            <ul className="mt-6 space-y-2 list-disc list-inside">
              <li>Clean, role-based dashboards</li>
              <li>Ordered modules and assignments per classroom</li>
              <li>Interview sessions + transcripts + feedback</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="px-6 md:px-10 py-16 bg-background">
        <div className="mx-auto max-w-6xl">
          <h3 className="text-2xl font-semibold">Why MyUni</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-none border border-white/15 bg-card/40 p-5">
              <div className="text-sm text-muted-foreground">Submissions</div>
              <div className="mt-1 text-xl font-medium">Instant verdicts</div>
              <p className="mt-2 text-sm text-muted-foreground">Compile, run, and evaluate code across problems with detailed per-test results.</p>
            </div>
            <div className="rounded-none border border-white/15 bg-card/40 p-5">
              <div className="text-sm text-muted-foreground">Classrooms</div>
              <div className="mt-1 text-xl font-medium">Structured learning</div>
              <p className="mt-2 text-sm text-muted-foreground">Teachers create modules, map assignments, and track student progress.</p>
            </div>
            <div className="rounded-none border border-white/15 bg-card/40 p-5">
              <div className="text-sm text-muted-foreground">Interviews</div>
              <div className="mt-1 text-xl font-medium">Practice that sticks</div>
              <p className="mt-2 text-sm text-muted-foreground">Run mock sessions, capture transcripts, and view actionable feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-10 py-16 bg-black text-white">
        <div className="mx-auto max-w-6xl grid gap-4 md:grid-cols-3">
          <div className="rounded-none border border-white/15 p-5">
            <div className="text-xl font-semibold">Super fast and clean.</div>
            <p className="mt-2 text-sm text-zinc-300">Our students love the verdict speed and clarity of feedback.</p>
          </div>
          <div className="rounded-none border border-white/15 p-5">
            <div className="text-xl font-semibold">Perfect for modules.</div>
            <p className="mt-2 text-sm text-zinc-300">Easy to plan, order, and run assignments per classroom.</p>
          </div>
          <div className="rounded-none border border-white/15 p-5">
            <div className="text-xl font-semibold">Interview ready.</div>
            <p className="mt-2 text-sm text-zinc-300">Mock sessions with transcripts helped me land my offer.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-6 flex-col md:flex-row">
          <div>
            <h4 className="text-2xl font-semibold">Start building your skills today</h4>
            <p className="opacity-90">Sign in to join classrooms or create assignments as a teacher.</p>
          </div>
          <a href="/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)] h-10 px-5">Sign in</a>
        </div>
      </section>
    </main>
  )
}
