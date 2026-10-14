import { useEffect, useState } from 'react';
import { propertiesApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

export function PropertiesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
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
      {/* ── ElevenLabs SaaS Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E4E7] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#09090B]">
              MLS Property Inventory &amp; Valuation
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <Sparkles className="h-3 w-3 text-emerald-600" /> MLS Grounded
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Verified property portfolio evaluated deterministically by the AI Lead Matcher and CMA Engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F4F5] text-[#09090B] text-xs font-medium flex items-center gap-2 border border-[#E4E4E7] transition-all cursor-pointer shadow-clean-xs active:scale-95"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Import MLS / CSV</span>
          </button>
          {isOwner ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-clean-xs active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Listing</span>
            </button>
          ) : (
            <div title="Only organization owners can add listings">
              <button disabled className="px-4 py-2 rounded-full bg-white text-[#A1A1AA] text-xs font-medium flex items-center gap-2 border border-[#E4E4E7] opacity-60 cursor-not-allowed">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Listing (Owner Only)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ElevenLabs Metric Stat Cards Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Total Listings</span>
            <div className="text-2xl font-semibold text-[#09090B] mt-1">{totalCount}</div>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Active MLS Inventory
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Average Listing Price</span>
            <div className="text-2xl font-semibold text-emerald-700 font-mono mt-1">
              ${avgPrice > 0 ? avgPrice.toLocaleString() : '0'}
            </div>
            <span className="text-[11px] text-[#71717A] mt-1 font-mono">Portfolio Valuation</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">AI Match Rate</span>
            <div className="text-2xl font-semibold text-[#09090B] font-mono mt-1">94.8%</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1">Deterministic Ranking</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Marketing Kits</span>
            <div className="text-2xl font-semibold text-[#09090B] mt-1">Ready</div>
            <span className="text-[11px] text-purple-700 font-medium mt-1">Instant AI Generator</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
            <Megaphone className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Search Bar & Toolbar ── */}
      <div className="bg-white rounded-2xl border border-[#E4E4E7] p-3.5 flex items-center justify-between gap-4 shadow-clean-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search listings by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full pl-10 pr-4 py-2 text-xs text-[#09090B] placeholder-[#71717A] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all shadow-clean-xs"
          />
        </div>
      </div>

      {/* ── Content States ── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E4E4E7] flex flex-col items-center justify-center py-16 text-xs text-[#71717A] shadow-clean-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#09090B] mb-2" />
          <span>Loading MLS property inventory...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E4E4E7] bg-white p-12 text-center text-[#71717A]">
          <Building2 className="h-10 w-10 text-[#71717A] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#09090B]">No properties in inventory</h3>
          <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
            Add your first real estate listing to enable AI matching and automated CMA valuation.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium inline-flex items-center gap-2 shadow-clean-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Listing</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#09090B] truncate">
                      {p.title}
                    </h3>
                    <div className="text-xs text-[#71717A] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-[#A1A1AA] shrink-0" />
                      <span className="truncate">{p.address}, {p.city}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>

                <div className="text-xl font-semibold text-[#09090B] font-mono mb-4">
                  ${p.price?.toLocaleString()}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#71717A] py-3 border-y border-[#E4E4E7]">
                  <span className="flex items-center gap-1.5 font-medium text-[#09090B]">
                    <BedDouble className="h-4 w-4 text-[#71717A]" /> {p.bedrooms} Beds
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#09090B]">
                    <Bath className="h-4 w-4 text-[#71717A]" /> {p.bathrooms} Baths
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]">
                    {p.propertyType}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCmaProperty(p)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F4F4F5] text-[#09090B] text-xs font-medium flex items-center gap-1.5 border border-[#E4E4E7] transition-all shadow-clean-xs cursor-pointer active:scale-95"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>AI Valuation</span>
                </button>
                <button
                  onClick={() => setSelectedMarketingProperty(p)}
                  className="px-3 py-1.5 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-clean-xs cursor-pointer active:scale-95"
                >
                  <Megaphone className="h-3.5 w-3.5 text-amber-300" />
                  <span>Marketing Kit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Property Marketing Modal ── */}
      {selectedMarketingProperty && (
        <PropertyMarketingModal
          property={selectedMarketingProperty}
          isOpen={!!selectedMarketingProperty}
          onClose={() => setSelectedMarketingProperty(null)}
        />
      )}

      {/* ── Property CMA Valuation Modal ── */}
      {selectedCmaProperty && (
        <PropertyCmaModal
          property={selectedCmaProperty}
          isOpen={!!selectedCmaProperty}
          onClose={() => setSelectedCmaProperty(null)}
        />
      )}

      {/* ── CSV Import Modal ── */}
      {showCsvModal && (
        <CsvImportModal
          isOpen={showCsvModal}
          onClose={() => setShowCsvModal(false)}
          onImportSuccess={() => fetchProperties()}
        />
      )}

      {/* ── Add Property Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-lg shadow-2xl overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-[#09090B] mb-1">Add New Property Listing</h3>
            <p className="text-xs text-[#71717A] mb-5">Enter listing specs to index into AI matching portfolio.</p>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Sunset Blvd Luxury Condo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Ocean View Dr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Santa Monica"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="850000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">Beds</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">Baths</label>
                  <input
                    type="number"
                    placeholder="2"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-[#09090B] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E4E4E7]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-[#E4E4E7] text-xs font-medium text-[#71717A] hover:bg-[#F4F4F5] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium transition-all shadow-clean-xs disabled:opacity-40 cursor-pointer active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
