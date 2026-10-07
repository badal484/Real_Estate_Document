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

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-indigo-600" />
            Property Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified database listings evaluated deterministically by the AI Property Matcher.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import CSV / MLS
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Property Listing
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* ── Content States ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
          <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No properties in inventory</h3>
          <p className="text-sm text-slate-500 mt-1">Add your first real estate listing to enable AI matching.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{p.address}, {p.city}</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <DollarSign className="h-4 w-4" /> Price:
                    </span>
                    <span className="text-base">${p.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-indigo-500" /> {p.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-indigo-500" /> {p.bathrooms} Baths
                    </span>
                    <span className="font-semibold text-slate-700">{p.propertyType}</span>
                  </div>
                </div>

                {/* AI Tools Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    onClick={() => setSelectedMarketingProperty(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-indigo-200"
                  >
                    <Megaphone className="h-3 w-3" /> Marketing Kit
                  </button>
                  <button
                    onClick={() => setSelectedCmaProperty(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                  >
                    <BarChart3 className="h-3 w-3" /> CMA Valuation
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Listing ID: {p.id.slice(-8)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Property Listing to Inventory</h2>
            <form onSubmit={handleCreateProperty} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Downtown Penthouse"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="100 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Downtown"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="650000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="CONDO">Condo</option>
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5"
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
