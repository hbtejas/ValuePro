import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, TrendingUp, Target, PieChart, Terminal, ShieldCheck } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../utils/calculatorData';
import TiltCard from '../components/common/TiltCard';

const stats = [
  { value: '30', label: 'CALCULATORS' },
  { value: '04', label: 'MODULES' },
  { value: '₹', label: 'LAKH / CRORE' },
  { value: '0', label: 'SIGNUP REQUIRED' },
];

const features = [
  {
    icon: TrendingUp,
    title: 'Valuation',
    text: 'Graham, Lynch, EPV, DCF and a combined fair-value view that puts seven models side by side.',
  },
  {
    icon: PieChart,
    title: 'Planning',
    text: 'SIP, lump sum, retirement, inflation and allocation tools built for Indian asset classes.',
  },
  {
    icon: Target,
    title: 'Returns & Risk',
    text: 'CAGR, XIRR, DRIP and cash-flow analysis with tabular figures and clear assumptions.',
  },
  {
    icon: ShieldCheck,
    title: 'Screener',
    text: 'Live prices, statements, peer comparison and a transparent risk score for every stock.',
  },
];

const steps = [
  { title: 'Pick a tool', text: 'Choose from 30 calculators grouped into four focused modules.' },
  { title: 'Enter inputs', text: 'Type numbers with prefix and suffix hints. Every field is unit-labelled.' },
  { title: 'Read the result', text: 'Compare outputs, review the method, and save to history when logged in.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 h-16 flex items-center justify-between gap-sp-6">
          <Link to="/" className="flex items-center gap-sp-5 shrink-0">
            <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center">
              <span className="text-onaccent font-mono font-semibold text-base leading-none">V</span>
            </div>
            <span className="font-display font-semibold text-base">ValuePro</span>
            <span className="font-mono text-xs text-muted hidden sm:inline">/ INDIA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-sp-8" aria-label="Primary">
            <a href="#features" className="text-sm text-muted hover:text-accent transition-colors duration-150">Features</a>
            <a href="#calculators" className="text-sm text-muted hover:text-accent transition-colors duration-150">Calculators</a>
            <Link to="/screener" className="text-sm text-muted hover:text-accent transition-colors duration-150">Screener</Link>
            <a href="#workflow" className="text-sm text-muted hover:text-accent transition-colors duration-150">Workflow</a>
          </nav>

          <div className="flex items-center gap-sp-3 shrink-0">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Login</Link>
            <Link to="/dashboard" className="btn-primary">
              Open toolkit <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-surface-border">
          <div className="pointer-events-none absolute inset-0 console-grid grid-fade opacity-50" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-32 right-0 w-96 h-96 accent-glow rounded-full opacity-40" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-9 lg:py-9 grid lg:grid-cols-2 gap-sp-9 items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.12 }}
              className="space-y-sp-6"
            >
              <span className="mono-label !text-accent">// VALUEPRO INDIA · v1.0</span>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold tracking-tight">
                Valuation tools for the{' '}
                <span className="relative text-accent">
                  Indian investor.
                  <span className="absolute left-0 -bottom-1 h-px w-full bg-accent/40" />
                </span>
              </h1>
              <p className="text-base text-muted max-w-xl">
                Thirty calculators for stocks, portfolios and long-term plans. Graham, DCF, SIP,
                XIRR and a live screener — with ₹ lakh / crore formatting throughout.
              </p>

              <div className="flex flex-wrap gap-sp-3">
                <Link to="/dashboard" className="btn-primary">
                  Open dashboard <ArrowRight size={15} />
                </Link>
                <Link to="/calculators" className="btn-secondary">
                  Browse calculators
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-sp-8 gap-y-sp-3 pt-sp-6 border-t border-surface-border font-mono text-xs text-muted">
                <span className="flex items-center gap-sp-2"><Check size={12} className="text-positive" /> 30 TOOLS</span>
                <span className="flex items-center gap-sp-2"><Check size={12} className="text-positive" /> NO SIGNUP</span>
                <span className="flex items-center gap-sp-2"><Check size={12} className="text-positive" /> INDIAN FORMATTING</span>
              </div>
            </motion.div>

            {/* Console preview */}
            <div className="relative perspective">
              <div className="pointer-events-none absolute -top-6 -left-6 z-10 panel px-sp-5 py-sp-3 float-a preserve-3d" aria-hidden="true">
                <span className="font-mono text-xs text-accent">+20.5% MOS</span>
              </div>
              <div className="pointer-events-none absolute -right-5 bottom-10 z-10 panel px-sp-5 py-sp-3 float-b preserve-3d" aria-hidden="true">
                <span className="font-mono text-xs text-positive">DCF ✓</span>
              </div>
              <TiltCard intensity={6}>
                <div className="panel preserve-3d shadow-xl accent-glow">
              <div className="flex items-center justify-between px-sp-6 py-sp-3 bg-surface-secondary border-b border-surface-border">
                <span className="flex items-center gap-sp-3 font-mono text-xs text-muted">
                  <Terminal size={13} className="text-accent" /> valuation.run
                </span>
                <span className="font-mono text-xs text-muted">INR</span>
              </div>
              <div className="p-sp-6 font-mono text-sm space-y-sp-5">
                <p className="text-muted">
                  <span className="text-accent">$</span> valuepro intrinsic-value --ticker RELIANCE.NS
                </p>
                <div className="border-l border-surface-border pl-sp-6 space-y-sp-3">
                  <div className="flex justify-between gap-sp-6"><span className="text-muted">Graham number</span><span className="text-ink">₹2,418.50</span></div>
                  <div className="flex justify-between gap-sp-6"><span className="text-muted">DCF fair value</span><span className="text-ink">₹2,760.00</span></div>
                  <div className="flex justify-between gap-sp-6"><span className="text-muted">Current price</span><span className="text-ink">₹2,195.00</span></div>
                  <div className="flex justify-between gap-sp-6"><span className="text-muted">Margin of safety</span><span className="text-positive">+20.5%</span></div>
                </div>
                <div className="border-t border-surface-border pt-sp-5 space-y-sp-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">MODEL AGREEMENT</span>
                    <span className="text-accent">07 / 07</span>
                  </div>
                  <div className="h-sp-2 bg-surface-secondary rounded-pill overflow-hidden">
                    <div className="h-full w-full bg-accent rounded-pill" />
                  </div>
                </div>
                <div className="border-t border-surface-border pt-sp-5 space-y-sp-3">
                  <span className="mono-label">Cashflow trend</span>
                  <div className="flex items-end gap-sp-1 h-12" aria-hidden="true">
                    {[42, 58, 36, 72, 51, 84, 66, 95, 74, 100].map((height, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm origin-bottom"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 0.4 + i * 0.05 }}
                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 + i * 0.05 }}
                        style={{
                          height: `${height}%`,
                          backgroundColor: i > 6 ? '#10B981' : i > 3 ? '#F59E0B' : '#F97316',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted">
                  <span className="text-positive">✓</span> undervalued <span className="text-muted">· 7 models compared</span>
                </p>
                </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-surface-border bg-surface-secondary/40">
          <div className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-sp-8 lg:py-sp-9 px-sp-6 first:pl-0">
                <div className="font-mono text-2xl lg:text-3xl font-semibold text-ink">{stat.value}</div>
                <div className="mono-label mt-sp-3">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section id="features" className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-9 space-y-sp-9 scroll-mt-20">
          <div className="max-w-2xl space-y-sp-3">
            <div className="section-rule"><span className="mono-label !text-accent">// CAPABILITIES</span></div>
            <h2 className="text-2xl font-display font-semibold">Everything you need to size up a stock.</h2>
            <p className="text-base text-muted">
              Each tool exposes its assumptions, shows the working, and keeps financial figures in a
              tabular mono font so columns stay aligned.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-sp-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <TiltCard key={feature.title} intensity={7}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.08 }}
                    className="panel preserve-3d h-full p-sp-6 space-y-sp-5 hover:border-accent/50 hover:shadow-lg transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-sm bg-accent/10 flex items-center justify-center depth-layer">
                        <Icon size={17} strokeWidth={1.75} className="text-accent" />
                      </div>
                      <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{feature.text}</p>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>
        </section>

        {/* Calculator modules */}
        <section id="calculators" className="border-y border-surface-border bg-surface-secondary/30 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-9 space-y-sp-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-sp-6">
              <div className="space-y-sp-3">
                <div className="section-rule"><span className="mono-label !text-accent">// TOOL INDEX</span></div>
                <h2 className="text-2xl font-display font-semibold">Four modules. Thirty calculators.</h2>
              </div>
              <Link to="/calculators" className="btn-secondary self-start md:self-auto">
                View full index <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-sp-5">
              {CALCULATOR_CATEGORIES.map((category, index) => {
                const Icon = category.icon;
                return (
                  <TiltCard key={category.id} intensity={6}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.08 }}
                      className="panel preserve-3d flex flex-col h-full hover:border-accent/50 hover:shadow-lg transition-colors duration-150"
                    >
                    <div className="p-sp-6 border-b border-surface-border space-y-sp-5 flex-1">
                      <div className={`w-9 h-9 rounded-sm ${category.bgColor} flex items-center justify-center`}>
                        <Icon size={17} strokeWidth={1.75} className={category.color} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{category.name}</h3>
                        <p className="font-mono text-xs text-muted mt-sp-1">{String(category.calculators.length).padStart(2, '0')} TOOLS</p>
                      </div>
                      <ul className="space-y-sp-3 text-sm text-muted">
                        {category.calculators.slice(0, 4).map((calc) => (
                          <li key={calc.id} className="flex items-center gap-sp-3">
                            <span className="w-sp-2 h-sp-2 bg-accent rounded-sm shrink-0" />
                            <span className="truncate">{calc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      to={`/calculator/${category.calculators[0].id}`}
                      className="px-sp-6 py-sp-5 flex items-center justify-between text-sm text-muted hover:text-accent transition-colors duration-150"
                    >
                      Open module <ArrowRight size={14} />
                    </Link>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-9 space-y-sp-8 scroll-mt-20">
          <div className="space-y-sp-3">
            <div className="section-rule"><span className="mono-label !text-accent">// WORKFLOW</span></div>
            <h2 className="text-2xl font-display font-semibold">From inputs to insight in three steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-sp-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.08 }}
                className="panel p-sp-6 border-t-2 border-t-accent space-y-sp-5"
              >
                <span className="font-mono text-xs text-accent">STEP {String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 pb-sp-9">
          <div className="panel relative accent-glow p-sp-9 border-t-2 border-t-accent flex flex-col lg:flex-row items-start justify-between gap-sp-8">
            <span className="absolute right-sp-8 top-sp-8 hidden lg:block font-mono text-xs text-accent pulse-accent" aria-hidden="true">// READY</span>
            <div className="space-y-sp-5 max-w-2xl">
              <span className="mono-label !text-accent">// GET STARTED</span>
              <h2 className="text-3xl font-display font-semibold tracking-tight">Start with a number.</h2>
              <p className="text-base text-muted">
                Open the dashboard, pick a calculator, and run your first valuation. Save results to
                history with a free account.
              </p>
            </div>
            <Link to="/dashboard" className="btn-primary shrink-0">
              Open dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-border bg-surface-secondary/40">
        <div className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-8 flex flex-col md:flex-row justify-between gap-sp-8">
          <div className="space-y-sp-3">
            <div className="flex items-center gap-sp-3">
              <div className="w-7 h-7 rounded-sm bg-accent flex items-center justify-center">
                <span className="text-onaccent font-mono font-semibold text-sm">V</span>
              </div>
              <span className="font-display font-semibold">ValuePro India</span>
            </div>
            <p className="font-mono text-xs text-muted">Stock valuation &amp; investment toolkit.</p>
          </div>

          <nav className="flex flex-wrap gap-x-sp-8 gap-y-sp-3 font-mono text-xs text-muted" aria-label="Footer">
            <Link to="/dashboard" className="hover:text-accent transition-colors duration-150">DASHBOARD</Link>
            <Link to="/calculators" className="hover:text-accent transition-colors duration-150">CALCULATORS</Link>
            <Link to="/screener" className="hover:text-accent transition-colors duration-150">SCREENER</Link>
            <Link to="/login" className="hover:text-accent transition-colors duration-150">ACCOUNT</Link>
          </nav>

          <p className="font-mono text-xs text-muted max-w-sm leading-relaxed">
            Educational use only. Not investment advice. Consult a SEBI-registered advisor before
            making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
