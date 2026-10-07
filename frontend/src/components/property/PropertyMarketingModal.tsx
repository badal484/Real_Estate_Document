import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  Mail,
  FileText,
  Megaphone,
  X,
  CheckCircle2,
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
    description?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyMarketingModal({ property, isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'INSTAGRAM' | 'EMAIL' | 'MLS' | 'FLYER'>('INSTAGRAM');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  // AI Generated Marketing Copy Templates
  const copyTemplates = {
    INSTAGRAM: `🏡 JUST LISTED in ${property.city}! ✨

Step inside this stunning ${property.bedrooms} Bed, ${property.bathrooms} Bath ${property.propertyType} located at ${property.address}! 

💰 Offered at: ${formattedPrice}

Key Highlights:
✨ Prime location in ${property.city}
✨ Spacious layout with modern finishes
✨ Ready for immediate move-in!

📲 DM us for a private showing or text "SHOWING" to book your tour today! 

#RealEstate #${property.city.replace(/\s+/g, '')}Homes #JustListed #${property.propertyType.replace(/\s+/g, '')} #HomeBuying #PropertyTour #DreamHome`,

    EMAIL: `Subject: Exclusive Listing Alert: ${property.bedrooms} Bed ${property.propertyType} in ${property.city}

Hi there,

We are excited to share a brand-new listing that just hit the market in ${property.city}!

📍 Address: ${property.address}, ${property.city}
💰 Offered Price: ${formattedPrice}
🏠 Specs: ${property.bedrooms} Bedrooms | ${property.bathrooms} Bathrooms | ${property.propertyType}

Property Description:
"${property.description || `Beautiful ${property.bedrooms}-bedroom ${property.propertyType.toLowerCase()} situated in a prime ${property.city} neighborhood. Features open-concept living spaces, premium upgrades, and exceptional value.`}"

This property is expected to move fast. Click below or reply directly to schedule your private tour this weekend!

[Schedule Private Showing Today]

Best regards,
Your Dedicated Real Estate Team`,

    MLS: `STUNNING ${property.bedrooms} BEDROOM ${property.propertyType.toUpperCase()} IN PRIME ${property.city.toUpperCase()} LOCATION. Welcome to ${property.address}! This exceptionally maintained ${property.bedrooms}-bed, ${property.bathrooms}-bath property offers the perfect combination of luxury, layout, and convenience. Offered at ${formattedPrice}. Features high ceilings, abundant natural light, updated kitchen appliances, and spacious master suite. Close to top-rated schools, shopping, and dining. Don't miss this turnkey opportunity!`,

    FLYER: `🔥 EXCLUSIVE OPEN HOUSE THIS WEEKEND 🔥

${property.address}, ${property.city}
OFFERED AT ${formattedPrice}

🏠 SPECS AT A GLANCE:
• ${property.bedrooms} Bedrooms | ${property.bathrooms} Bathrooms
• ${property.propertyType}
• Move-in Ready Condition

Join us for our private walkthrough tour Saturday 11 AM - 2 PM!
Contact Agent for Private Entry Code & Disclosures.`,
  };

  function handleCopy(text: string, tabName: string) {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                AI Marketing Suite
              </Badge>
              <span className="text-xs text-slate-400">{property.city}</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-sky-400" /> {property.title}
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{formattedPrice} • {property.address}</p>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('INSTAGRAM')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'INSTAGRAM' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="h-4 w-4" /> Social Post
          </button>
          <button
            onClick={() => setActiveTab('EMAIL')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'EMAIL' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="h-4 w-4" /> Email Blast
          </button>
          <button
            onClick={() => setActiveTab('MLS')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'MLS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" /> MLS Copy
          </button>
          <button
            onClick={() => setActiveTab('FLYER')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'FLYER' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="h-4 w-4" /> Open House Flyer
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Generated {activeTab} Marketing Copy
            </span>

            <button
              onClick={() => handleCopy(copyTemplates[activeTab], activeTab)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copiedTab === activeTab ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedTab === activeTab ? 'Copied to Clipboard!' : 'Copy Copy'}
            </button>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800 select-all">
            {copyTemplates[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
