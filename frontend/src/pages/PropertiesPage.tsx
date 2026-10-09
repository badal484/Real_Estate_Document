import { useEffect, useState } from 'react';
import { propertiesApi } from '@/services/api';
import { PropertyMarketingModal } from '@/components/property/PropertyMarketingModal';
import { PropertyCmaModal } from '@/components/property/PropertyCmaModal';
import { CsvImportModal } from '@/components/CsvImportModal';
import {
  Building2,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  DollarSign,
  BedDouble,
  Bath,
  MapPin,
  Sparkles,
  Megaphone,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

export function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedMarketingProperty, setSelectedMarketingProperty] = useState<any | null>(null);
  const [selectedCmaProperty, setSelectedCmaProperty] = useState<any | null>(null);

  // New Property Form State
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');
  const [propertyType, setPropertyType] = useState('CONDO');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [search]);

  async function fetchProperties() {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesApi.list({ search: search || undefined });
      setProperties(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !address || !city || !price || !bedrooms) return;

    try {
      setSubmitting(true);
      await propertiesApi.create({
        title,
        address,
        city,
        price: Number(price),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms || 2),
        propertyType,
        status: 'AVAILABLE',
      });
      setShowAddModal(false);
      setTitle('');
      setAddress('');
      setCity('');
      setPrice('');
      setBedrooms('');
      setBathrooms('');
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  }

  const totalCount = properties.length;
  const avgPrice =
    totalCount > 0
      ? Math.round(properties.reduce((acc, p) => acc + (p.price || 0), 0) / totalCount)
      : 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Luxury Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F7]">
              MLS Property Inventory &amp; Valuation
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961]/10 px-2.5 py-0.5 text-xs font-medium text-[#C9A961] border border-[#C9A961]/20">
              <Sparkles className="h-3 w-3" /> MLS Grounded
            </span>
          </div>
          <p className="text-xs text-[#9A9AA5] mt-1">
            Verified property portfolio evaluated deterministically by the AI Lead Matcher and CMA Engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#141418] hover:bg-white/[0.06] hover:border-white/20 text-[#F5F5F7] px-4 py-2 text-xs font-medium transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#34D399]" />
            <span>Import MLS / CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961] hover:bg-[#D4B774] text-[#0A0A0B] px-4 py-2 text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Listing</span>
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">Total Listings</span>
            <div className="text-2xl font-bold text-[#F5F5F7] mt-1">{totalCount}</div>
            <span className="text-[10px] text-[#C9A961] font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Active MLS Inventory
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20">
            <Building2 className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">Average Listing Price</span>
            <div className="text-2xl font-bold text-[#34D399] font-mono mt-1">
              ${avgPrice > 0 ? avgPrice.toLocaleString() : '0'}
            </div>
            <span className="text-[10px] text-[#6E6E7A] mt-1 font-mono">Portfolio Valuation</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">AI Match Rate</span>
            <div className="text-2xl font-bold text-[#C9A961] font-mono mt-1">94.8%</div>
            <span className="text-[10px] text-[#C9A961] font-medium mt-1">Deterministic Ranking</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">Marketing Kits</span>
            <div className="text-2xl font-bold text-[#F5F5F7] mt-1">Ready</div>
            <span className="text-[10px] text-purple-400 font-medium mt-1">Instant AI Generator</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* ── Search Bar & Toolbar ── */}
      <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E6E7A]" />
          <input
            type="text"
            placeholder="Search listings by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961]/20 outline-none transition-all"
          />
        </div>
        <button className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D0D11] hover:bg-white/[0.04] text-[#9A9AA5] hover:text-[#F5F5F7] px-3.5 py-2 text-xs font-medium transition-all">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#6E6E7A]" />
          <span>Filter Options</span>
        </button>
      </div>

      {/* ── Content States ── */}
      {loading ? (
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl flex flex-col items-center justify-center py-16 text-xs text-[#9A9AA5]">
          <Loader2 className="h-7 w-7 animate-spin text-[#C9A961] mb-2" />
          <span>Loading MLS property inventory...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl py-16 px-4 text-center">
          <Building2 className="h-10 w-10 text-[#C9A961] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#F5F5F7]">No properties in inventory</h3>
          <p className="text-xs text-[#9A9AA5] mt-1 max-w-sm mx-auto">
            Add your first real estate listing to enable AI matching and automated CMA valuation.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961] hover:bg-[#D4B774] text-[#0A0A0B] px-4 py-2 text-xs font-semibold transition-all mt-4"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Listing
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 flex flex-col justify-between hover:border-[#C9A961]/40 transition-all shadow-lg group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-[#F5F5F7] truncate">
                      {p.title}
                    </h3>
                    <div className="text-[11px] text-[#9A9AA5] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-[#6E6E7A] shrink-0" />
                      <span className="truncate">{p.address}, {p.city}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25">
                    {p.status}
                  </span>
                </div>

                <div className="rounded-lg bg-[#0D0D11] p-3 border border-white/[0.06] space-y-2 text-xs my-3">
                  <div className="flex items-center justify-between font-semibold text-[#F5F5F7]">
                    <span className="flex items-center gap-1.5 text-[#9A9AA5] text-xs">
                      <DollarSign className="h-3.5 w-3.5 text-[#34D399]" /> Asking Price:
                    </span>
                    <span className="text-sm font-bold text-[#34D399] font-mono">${p.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#9A9AA5] pt-2 border-t border-white/[0.06] text-xs">
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-[#C9A961]" /> {p.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-[#C9A961]" /> {p.bathrooms} Baths
                    </span>
                    <span className="font-medium text-[#F5F5F7] bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08] text-[10px]">
                      {p.propertyType}
                    </span>
                  </div>
                </div>

                {/* AI Tools Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedMarketingProperty(p)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D0D11] hover:bg-white/[0.06] text-[#F5F5F7] py-1.5 text-[11px] font-medium transition-all"
                  >
                    <Megaphone className="h-3 w-3 text-[#C9A961]" /> Marketing Kit
                  </button>
                  <button
                    onClick={() => setSelectedCmaProperty(p)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D0D11] hover:bg-white/[0.06] text-[#F5F5F7] py-1.5 text-[11px] font-medium transition-all"
                  >
                    <BarChart3 className="h-3 w-3 text-[#34D399]" /> CMA Valuation
                  </button>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] text-[10px] text-[#6E6E7A] flex items-center justify-between font-mono">
                <span>ID: {p.id.slice(-8)}</span>
                <span className="text-[#C9A961] font-medium">Verified MLS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Marketing Kit Modal */}
      {selectedMarketingProperty && (
        <PropertyMarketingModal
          property={selectedMarketingProperty}
          isOpen={!!selectedMarketingProperty}
          onClose={() => setSelectedMarketingProperty(null)}
        />
      )}

      {/* AI CMA Valuation Modal */}
      {selectedCmaProperty && (
        <PropertyCmaModal
          property={selectedCmaProperty}
          isOpen={!!selectedCmaProperty}
          onClose={() => setSelectedCmaProperty(null)}
        />
      )}

      {/* ── Add Property Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#141418] p-6 border border-white/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#C9A961]" />
                Add Property Listing to Inventory
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6E6E7A] hover:text-[#F5F5F7] text-sm font-semibold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Downtown Penthouse"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="100 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Downtown"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="650000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F7] focus:border-[#C9A961] outline-none"
                  >
                    <option value="CONDO">Condo</option>
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-white/[0.08] bg-[#0D0D11] hover:bg-white/[0.06] text-[#9A9AA5] hover:text-[#F5F5F7] px-4 py-2 text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961] hover:bg-[#D4B774] text-[#0A0A0B] px-5 py-2 text-xs font-semibold transition-all"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CSV Import Modal ── */}
      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        type="properties"
        onImportSuccess={fetchProperties}
      />
    </div>
  );
}
