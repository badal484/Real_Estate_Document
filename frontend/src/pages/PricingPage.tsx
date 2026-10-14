import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  Calculator,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-[#FBFBFC] text-[#09090B] pb-24 font-sans">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="neutral" className="mb-4 bg-zinc-100 text-zinc-800 border border-[#E4E4E7] px-3.5 py-1 text-xs font-medium rounded-full">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600 inline" />
            Transparent E&amp;O Protection Pricing
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#09090B] sm:text-5xl lg:text-6xl">
            Protect Millions in Deals for <span className="underline decoration-zinc-300 underline-offset-8">a Fraction of a Single Commission</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            One missed contingency deadline can cost $25,000+ in earnest money or spark an E&amp;O lawsuit. Choose the tier that secures your real estate transactions.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 p-1 bg-[#F4F4F5] rounded-full border border-[#E4E4E7]">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !isAnnual
                    ? 'bg-white text-[#09090B] shadow-clean-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isAnnual
                    ? 'bg-white text-[#09090B] shadow-clean-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Solo Agent Plan */}
          <div className="bg-white relative flex flex-col p-8 rounded-3xl border border-[#E4E4E7] shadow-clean-sm hover:shadow-clean-md transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#09090B]">Solo Agent</h3>
              <p className="text-xs text-[#71717A] mt-1">For active individual real estate agents</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#09090B] font-mono">
                  ${isAnnual ? '39' : '49'}
                </span>
                <span className="text-sm font-medium text-[#71717A]">/ agent / mo</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                {isAnnual ? 'Billed annually ($468/yr)' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-3.5 text-xs text-[#71717A] mb-8 flex-1">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Up to 15 active deals simultaneously</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Instant PDF &amp; scanned contract OCR extraction</span>
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

            <Button asChild className="w-full rounded-full border border-[#E4E4E7] bg-white hover:bg-zinc-100 text-[#09090B] font-semibold py-2.5 shadow-clean-xs">
              <Link to="/upload">Start 14-Day Free Trial</Link>
            </Button>
          </div>

          {/* Brokerage Team Plan (Featured) */}
          <div className="bg-white relative flex flex-col p-8 rounded-3xl border-2 border-[#09090B] shadow-clean-md scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-[#09090B] text-white px-3.5 py-1 font-semibold text-xs shadow-clean-xs border-0 rounded-full">
                <Sparkles className="h-3 w-3 mr-1 inline text-amber-400" /> Most Popular for Teams
              </Badge>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-[#09090B]">Brokerage Team</h3>
              <p className="text-xs text-[#71717A] mt-1">For high-producing teams &amp; transaction coordinators</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#09090B] font-mono">
                  ${isAnnual ? '119' : '149'}
                </span>
                <span className="text-sm font-medium text-[#71717A]">/ agent / mo</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                {isAnnual ? 'Billed annually' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-3.5 text-xs text-[#71717A] mb-8 flex-1">
              <li className="flex items-center gap-2.5 font-semibold text-[#09090B]">
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
                <span>Brokerage Risk Radar &amp; Analytics Dashboard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>E&amp;O Insurance defense log exports</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Priority email &amp; SMS deadline escalation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated Transaction Coordinator workflow</span>
              </li>
            </ul>

            <Button asChild className="w-full rounded-full bg-[#09090B] hover:bg-black text-white font-semibold shadow-clean-xs py-2.5">
              <Link to="/upload">Get Started Now</Link>
            </Button>
          </div>

          {/* Enterprise Shield Plan */}
          <div className="bg-white relative flex flex-col p-8 rounded-3xl border border-[#E4E4E7] shadow-clean-sm hover:shadow-clean-md transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#09090B]">Enterprise Shield</h3>
              <p className="text-xs text-[#71717A] mt-1">For multi-office brokerages &amp; legal compliance teams</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#09090B] font-mono">Custom</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1">Tailored seat volume pricing</p>
            </div>

            <ul className="space-y-3.5 text-xs text-[#71717A] mb-8 flex-1">
              <li className="flex items-center gap-2.5 font-semibold text-[#09090B]">
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
                <span>Single Sign-On (SSO) &amp; Okta integration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Private Cloud or On-Premise deployment option</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>99.99% Uptime Guarantee &amp; 1-hr SLA</span>
              </li>
            </ul>

            <Button variant="outline" asChild className="w-full rounded-full border border-[#E4E4E7] bg-white hover:bg-zinc-100 text-[#09090B] font-semibold py-2.5 shadow-clean-xs">
              <Link to="/docs">Contact Enterprise Sales</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* Interactive Team Estimator */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-20">
        <div className="bg-white rounded-3xl p-8 border border-[#E4E4E7] shadow-clean-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-zinc-100 text-[#09090B] border border-[#E4E4E7]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#09090B]">Brokerage Team Investment Calculator</h2>
              <p className="text-xs text-[#71717A] mt-0.5">Adjust active agent seat count to calculate instant annual savings</p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex justify-between items-center text-sm font-medium mb-2">
                <span className="text-[#71717A] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#71717A]" /> Number of Active Agents/TCs:
                </span>
                <span className="text-[#09090B] text-base font-bold font-mono bg-[#F4F4F5] px-3.5 py-1 rounded-full border border-[#E4E4E7]">
                  {seats} Agents
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full h-2 bg-[#F4F4F5] rounded-lg appearance-none cursor-pointer accent-[#09090B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] text-center">
              <div>
                <p className="text-xs text-[#71717A]">Monthly Team Cost</p>
                <p className="text-2xl font-bold text-[#09090B] font-mono mt-1">${calculateTeamPrice()}/mo</p>
              </div>
              <div>
                <p className="text-xs text-[#71717A]">Estimated Annual E&amp;O Protection Value</p>
                <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">${(seats * 25000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#71717A]">Return on Investment</p>
                <p className="text-2xl font-bold text-[#09090B] font-mono mt-1">{Math.round((seats * 25000) / (calculateTeamPrice() * 12))}x ROI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed-to-Lead Revenue Calculator */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-12">
        <div className="rounded-3xl p-8 border border-[#E4E4E7] bg-white text-[#09090B] shadow-clean-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#09090B] flex items-center gap-2">
                Speed-to-Lead Revenue Growth Engine
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Harvard Business Review Benchmark
                </span>
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Responding to buyer inquiries under 60 seconds increases contact &amp; conversion rates by 391%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F9FAFB] p-6 rounded-2xl border border-[#E4E4E7]">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1.5">
                  <label className="font-semibold text-[#09090B]">Inbound Buyer Enquiries / Month</label>
                  <span className="text-sm font-bold text-[#09090B] font-mono bg-white px-2.5 py-0.5 rounded-full border border-[#E4E4E7]">
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
                  className="w-full h-2 bg-[#E4E4E7] rounded-lg appearance-none cursor-pointer accent-[#09090B]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1.5">
                  <label className="font-semibold text-[#09090B]">Avg Commission per Deal (GCI)</label>
                  <span className="text-sm font-bold text-[#09090B] font-mono bg-white px-2.5 py-0.5 rounded-full border border-[#E4E4E7]">
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
                  className="w-full h-2 bg-[#E4E4E7] rounded-lg appearance-none cursor-pointer accent-[#09090B]"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center bg-white p-6 rounded-2xl border border-[#E4E4E7] text-center shadow-clean-xs">
              <span className="text-xs uppercase tracking-wider font-bold text-[#71717A] mb-1">
                Estimated Additional Annual GCI
              </span>
              <div className="text-4xl font-extrabold text-emerald-600 tracking-tight font-mono">
                +${extraGciPerYear.toLocaleString()}
              </div>
              <p className="text-xs text-[#71717A] mt-2">
                Yields approximately <span className="font-bold text-[#09090B]">{extraDealsPerYear} extra closed deals</span> per year from instant AI auto-replies &amp; 1-click tour booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#09090B]">Compare Plans &amp; Capabilities</h2>
          <p className="text-sm text-[#71717A] mt-2">Detailed breakdown of features included across all tiers</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden shadow-clean-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#71717A] border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E4E4E7] text-[#09090B] font-bold">
                  <th className="py-4 px-6 text-sm">Feature</th>
                  <th className="py-4 px-4 text-center">Solo Agent</th>
                  <th className="py-4 px-4 text-center bg-zinc-100 text-[#09090B]">Brokerage Team</th>
                  <th className="py-4 px-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7]">
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">State Contract Rules (NWMLS, CAR, FAR/BAR, TREC)</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">PDF Citation Deep Linking (Verifiable Page Quotes)</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">Resend Real-Time Email Escalations</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">Audit Trail Export for E&amp;O Lawsuit Defense</td>
                  <td className="py-3.5 px-4 text-center text-[#A1A1AA]">Basic</td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50 font-bold text-emerald-700">Full Certified Log</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">Enterprise Encrypted</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">Custom Brokerage Clause Parser Training</td>
                  <td className="py-3.5 px-4 text-center text-[#A1A1AA]">—</td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50 text-[#A1A1AA]">—</td>
                  <td className="py-3.5 px-4 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-[#09090B]">Single Sign-On (SSO / Okta / SAML)</td>
                  <td className="py-3.5 px-4 text-center text-[#A1A1AA]">—</td>
                  <td className="py-3.5 px-4 text-center bg-zinc-50 text-[#A1A1AA]">—</td>
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
