import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  DollarSign,
  CheckCircle2,
  X,
  Sparkles,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface Props {
  property: {
    title: string;
    address: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyCmaModal({ property, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const estSqFt = property.bedrooms * 650 + 400;
  const pricePerSqFt = Math.round(property.price / estSqFt);
  const estLowValuation = Math.round(property.price * 0.96);
  const estHighValuation = Math.round(property.price * 1.04);
  const estRentValue = Math.round(property.price * 0.0055);

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price);
  const formattedLow = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estLowValuation);
  const formattedHigh = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estHighValuation);
  const formattedRent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estRentValue);

  // Mock Nearby Comps in the same city
  const nearbyComps = [
    { address: `142 ${property.city} Blvd`, price: Math.round(property.price * 0.98), daysOnMarket: 12, sqft: estSqFt - 50 },
    { address: `88 ${property.city} Ave`, price: Math.round(property.price * 1.02), daysOnMarket: 8, sqft: estSqFt + 100 },
    { address: `210 ${property.city} Way`, price: Math.round(property.price * 0.95), daysOnMarket: 19, sqft: estSqFt - 120 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                AI Automated CMA Analysis
              </Badge>
              <span className="text-xs text-slate-400">{property.city} Market</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" /> Valuation &amp; Market Comps: {property.title}
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{formattedPrice} • {property.address}</p>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Est. Market Value</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono block mt-1">{formattedPrice}</span>
              <span className="text-[10px] text-emerald-600 font-bold">🎯 Target Price</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Price / Sq. Ft.</span>
              <span className="text-sm font-extrabold text-indigo-600 font-mono block mt-1">${pricePerSqFt} / sqft</span>
              <span className="text-[10px] text-slate-500">Est. {estSqFt} sqft</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Valuation Range</span>
              <span className="text-xs font-bold text-slate-800 font-mono block mt-1">{formattedLow} - {formattedHigh}</span>
              <span className="text-[10px] text-emerald-600 font-bold">±4% Variance</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Est. Monthly Rent</span>
              <span className="text-sm font-extrabold text-emerald-600 font-mono block mt-1">{formattedRent} / mo</span>
              <span className="text-[10px] text-slate-500">6.6% Cap Rate</span>
            </div>
          </div>

          {/* Nearby Market Comparable Sales */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Recent Nearby Comparable Sales ({property.city})
            </h3>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Comp Address</th>
                    <th className="p-3">Sold Price</th>
                    <th className="p-3">Price / SqFt</th>
                    <th className="p-3">Days on Market</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {nearbyComps.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{comp.address}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">
                        ${comp.price.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono">${Math.round(comp.price / comp.sqft)}</td>
                      <td className="p-3 font-mono text-slate-500">{comp.daysOnMarket} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
