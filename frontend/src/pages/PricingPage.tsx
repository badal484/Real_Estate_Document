import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Zap,
  Building2,
  Lock,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Calculator,
  AlertTriangle,
  Award,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [seats, setSeats] = useState(5);
  const [monthlyLeads, setMonthlyLeads] = useState(60);
  const [avgCommission, setAvgCommission] = useState(9000);

  const calculateTeamPrice = () => {
    const base = isAnnual ? 119 : 149;
    return seats * base;
  };

  // Speed-to-Lead Math (HBR Benchmark: Response under 60 seconds increases conversion by up to 391%)
  const extraDealsPerYear = Math.round((monthlyLeads * (0.65 - 0.22) * 0.04) * 12 * 10) / 10;
  const extraGciPerYear = Math.round(extraDealsPerYear * avgCommission);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="neutral" className="mb-4 glass-badge px-3 py-1 text-slate-700">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600 inline" />
            Transparent E&O Protection Pricing
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Protect Millions in Deals for <span className="bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 bg-clip-text text-transparent">Fraction of a Single Commission</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            One missed contingency deadline can cost $25,000+ in earnest money or spark an E&O lawsuit. Choose the plan that secures your real estate transactions.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-900 transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-slate-400/20"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual Billing
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Solo Agent Plan */}
          <Card className="glass-card relative flex flex-col p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Solo Agent</h3>
              <p className="text-xs text-slate-500 mt-1">For active individual real estate agents</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  ${isAnnual ? '39' : '49'}
                </span>
                <span className="text-sm font-medium text-slate-500">/ agent / mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAnnual ? 'Billed annually ($468/yr)' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700 mb-8 flex-1">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Up to 15 active deals simultaneously</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Instant PDF & scanned contract OCR extraction</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>NWMLS, CAR, FAR/BAR, TREC state rules engine</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Verifiable PDF page citation deep-links</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Resend Email alerts (Agent + Client notify)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Audit trail log for basic compliance</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
              <Link to="/upload">Start 14-Day Free Trial</Link>
            </Button>
          </Card>

          {/* Brokerage Team Plan (Featured) */}
          <Card className="glass-card relative flex flex-col p-8 rounded-2xl border-2 border-slate-900 shadow-xl scale-[1.02] bg-white/90">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-slate-900 text-white px-3 py-1 font-semibold text-xs shadow-md">
                <Sparkles className="h-3 w-3 text-sky-400 mr-1 inline" /> Most Popular for Teams
              </Badge>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-slate-900">Brokerage Team</h3>
              <p className="text-xs text-slate-500 mt-1">For high-producing teams & transaction coordinators</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  ${isAnnual ? '119' : '149'}
                </span>
                <span className="text-sm font-medium text-slate-500">/ agent / mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAnnual ? 'Billed annually' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700 mb-8 flex-1">
              <li className="flex items-center gap-2.5 font-semibold text-slate-900">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Everything in Solo Agent, plus:</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Unlimited active deal processing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Multi-agent shared team workspace</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Brokerage Risk Radar & Analytics Dashboard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>E&O Insurance defense log exports</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Priority email & SMS deadline escalation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated Transaction Coordinator workflow</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md">
              <Link to="/upload">Get Started Now</Link>
            </Button>
          </Card>

          {/* Enterprise Shield Plan */}
          <Card className="glass-card relative flex flex-col p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Enterprise Shield</h3>
              <p className="text-xs text-slate-500 mt-1">For multi-office brokerages & legal compliance teams</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">Custom</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tailored seat volume pricing</p>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700 mb-8 flex-1">
              <li className="flex items-center gap-2.5 font-semibold text-slate-900">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Everything in Team Plan, plus:</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Custom state contract parser training</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated Compliance Officer approval queue</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Single Sign-On (SSO) & Okta integration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Private Cloud or On-Premise deployment option</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>99.99% Uptime Guarantee & 1-hr SLA</span>
              </li>
            </ul>

            <Button variant="outline" asChild className="w-full font-semibold border-slate-300">
              <Link to="/docs">Contact Enterprise Sales</Link>
            </Button>
          </Card>

        </div>
      </section>

      {/* Interactive Team Estimator */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-20">
        <div className="glass-card rounded-2xl p-8 border border-slate-200/80 shadow-md bg-gradient-to-br from-white/90 via-slate-50/80 to-sky-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Calculator className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Brokerage Team Investment Calculator</h2>
              <p className="text-xs text-slate-500">Adjust active agent seat count to calculate instant annual savings</p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" /> Number of Active Agents/TCs:
                </span>
                <span className="text-slate-900 text-base font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {seats} Agents
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white border border-slate-200/80 text-center">
              <div>
                <p className="text-xs text-slate-500">Monthly Team Cost</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${calculateTeamPrice()}/mo</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estimated Annual E&O Protection Value</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">${(seats * 25000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Return on Investment</p>
                <p className="text-2xl font-bold text-sky-600 mt-1">{Math.round((seats * 25000) / (calculateTeamPrice() * 12))}x ROI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed-to-Lead Revenue Calculator */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-12">
        <div className="rounded-2xl p-8 border border-indigo-200/80 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Speed-to-Lead Revenue Growth Engine
                <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Harvard Business Review Benchmark
                </span>
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Responding to buyer inquiries under 60 seconds increases contact &amp; conversion rates by 391%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-indigo-200 mb-1.5">
                  <label className="font-semibold">Inbound Buyer Enquiries / Month</label>
                  <span className="text-sm font-bold text-white bg-indigo-900/60 px-2.5 py-0.5 rounded border border-indigo-400/30">
                    {monthlyLeads} leads
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-950/80 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-indigo-200 mb-1.5">
                  <label className="font-semibold">Avg Commission per Deal (GCI)</label>
                  <span className="text-sm font-bold text-white bg-indigo-900/60 px-2.5 py-0.5 rounded border border-indigo-400/30">
                    ${avgCommission.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="35000"
                  step="1000"
                  value={avgCommission}
                  onChange={(e) => setAvgCommission(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-950/80 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center bg-indigo-950/60 p-5 rounded-xl border border-indigo-400/20 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300 mb-1">
                Estimated Additional Annual GCI
              </span>
              <div className="text-4xl font-extrabold text-emerald-400 tracking-tight">
                +${extraGciPerYear.toLocaleString()}
              </div>
              <p className="text-xs text-indigo-200/90 mt-2">
                Yields approximately <span className="font-semibold text-white">{extraDealsPerYear} extra closed deals</span> per year from instant AI auto-replies &amp; 1-click tour booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Compare Plans & Capabilities</h2>
          <p className="text-sm text-slate-500 mt-2">Detailed breakdown of features included across all tiers</p>
        </div>

        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-900 font-bold">
                  <th className="py-4 px-6 text-sm">Feature</th>
                  <th className="py-4 px-4 text-center">Solo Agent</th>
                  <th className="py-4 px-4 text-center bg-slate-900 text-white rounded-t-lg">Brokerage Team</th>
                  <th className="py-4 px-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">State Contract Rules (NWMLS, CAR, FAR/BAR, TREC)</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-slate-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">PDF Citation Deep Linking (Verifiable Page Quotes)</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-slate-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Resend Real-Time Email Escalations</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-slate-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Audit Trail Export for E&O Lawsuit Defense</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">Basic</td>
                  <td className="py-3.5 px-4 text-center bg-slate-50 font-semibold text-emerald-700">Full Certified Log</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">Enterprise Encrypted</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Custom Brokerage Clause Parser Training</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center bg-slate-50 text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Single Sign-On (SSO / Okta / SAML)</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center bg-slate-50 text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
