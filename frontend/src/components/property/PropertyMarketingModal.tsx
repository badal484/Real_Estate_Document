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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-white flex items-center justify-between border-b border-[#E4E4E7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="neutral" className="bg-[#F4F4F5] text-[#09090B] border-[#E4E4E7] text-[10px] px-2.5 py-0.5 rounded-full">
                AI Marketing Suite
              </Badge>
              <span className="text-xs text-[#71717A]">{property.city}</span>
            </div>
            <h2 className="text-lg font-semibold text-[#09090B] flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-500" /> {property.title}
            </h2>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">{formattedPrice} • {property.address}</p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E4E4E7] bg-[#F9FAFB] p-3 overflow-x-auto">
          <div className="p-1 bg-[#F4F4F5] rounded-full inline-flex border border-[#E4E4E7] text-xs font-medium">
            <button
              onClick={() => setActiveTab('INSTAGRAM')}
              className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'INSTAGRAM' ? 'bg-white text-[#09090B] font-semibold shadow-xs' : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" /> <span>Social Post</span>
            </button>
            <button
              onClick={() => setActiveTab('EMAIL')}
              className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'EMAIL' ? 'bg-white text-[#09090B] font-semibold shadow-xs' : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> <span>Email Blast</span>
            </button>
            <button
              onClick={() => setActiveTab('MLS')}
              className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'MLS' ? 'bg-white text-[#09090B] font-semibold shadow-xs' : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> <span>MLS Copy</span>
            </button>
            <button
              onClick={() => setActiveTab('FLYER')}
              className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'FLYER' ? 'bg-white text-[#09090B] font-semibold shadow-xs' : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" /> <span>Open House Flyer</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#09090B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Generated {activeTab} Marketing Copy
            </span>

            <button
              onClick={() => handleCopy(copyTemplates[activeTab], activeTab)}
              className="px-4 py-1.5 rounded-full bg-[#09090B] hover:bg-black text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-clean-xs active:scale-95 cursor-pointer"
            >
              {copiedTab === activeTab ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedTab === activeTab ? 'Copied!' : 'Copy Copy'}</span>
            </button>
          </div>

          <div className="bg-[#F9FAFB] text-[#09090B] p-4 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap border border-[#E4E4E7] select-all">
            {copyTemplates[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
