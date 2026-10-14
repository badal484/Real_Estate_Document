import {
  BarChart3,
  TrendingUp,
  X,
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-white flex items-center justify-between border-b border-[#E4E4E7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="text-[10px] px-2.5 py-0.5 rounded-full">
                AI Automated CMA Analysis
              </Badge>
              <span className="text-xs text-[#71717A]">{property.city} Market</span>
            </div>
            <h2 className="text-lg font-semibold text-[#09090B] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" /> Valuation &amp; Market Comps: {property.title}
            </h2>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">{formattedPrice} • {property.address}</p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F9FAFB] border border-[#E4E4E7] p-3.5 rounded-2xl">
              <span className="text-[11px] text-[#71717A] font-medium block uppercase tracking-wider">Est. Market Value</span>
              <span className="text-sm font-semibold text-[#09090B] font-mono block mt-1">{formattedPrice}</span>
              <span className="text-[11px] text-emerald-700 font-medium">🎯 Target Price</span>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E4E4E7] p-3.5 rounded-2xl">
              <span className="text-[11px] text-[#71717A] font-medium block uppercase tracking-wider">Price / Sq. Ft.</span>
              <span className="text-sm font-semibold text-[#09090B] font-mono block mt-1">${pricePerSqFt} / sqft</span>
              <span className="text-[11px] text-[#71717A]">Est. {estSqFt} sqft</span>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E4E4E7] p-3.5 rounded-2xl">
              <span className="text-[11px] text-[#71717A] font-medium block uppercase tracking-wider">Valuation Range</span>
              <span className="text-xs font-semibold text-[#09090B] font-mono block mt-1">{formattedLow} - {formattedHigh}</span>
              <span className="text-[11px] text-emerald-700 font-medium">±4% Variance</span>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E4E4E7] p-3.5 rounded-2xl">
              <span className="text-[11px] text-[#71717A] font-medium block uppercase tracking-wider">Est. Monthly Rent</span>
              <span className="text-sm font-semibold text-emerald-700 font-mono block mt-1">{formattedRent} / mo</span>
              <span className="text-[11px] text-[#71717A]">6.6% Cap Rate</span>
            </div>
          </div>

          {/* Nearby Market Comparable Sales */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#09090B] flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Recent Nearby Comparable Sales ({property.city})
            </h3>

            <div className="rounded-2xl border border-[#E4E4E7] overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] text-[#71717A] font-medium border-b border-[#E4E4E7]">
                  <tr>
                    <th className="p-3">Comp Address</th>
                    <th className="p-3">Sold Price</th>
                    <th className="p-3">Price / SqFt</th>
                    <th className="p-3">Days on Market</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] text-[#09090B]">
                  {nearbyComps.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-[#F9FAFB]">
                      <td className="p-3 font-medium text-[#09090B]">{comp.address}</td>
                      <td className="p-3 font-mono font-semibold text-emerald-700">
                        ${comp.price.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono">${Math.round(comp.price / comp.sqft)}</td>
                      <td className="p-3 font-mono text-[#71717A]">{comp.daysOnMarket} Days</td>
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
