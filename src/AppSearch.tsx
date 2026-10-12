import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  Package, 
  Store, 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  Info, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Download, 
  Globe, 
  Clock, 
  DollarSign, 
  Layers, 
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Simple CSV parser that handles quoted fields
function parseCSV(text: string) {
  const lines = text.split(/\r\n|\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseLine = (line: string) => {
    const res = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        res.push(current);
        current = '';
      } else {
        current += c;
      }
    }
    res.push(current);
    return res;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = parseLine(line);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (vals[j] !== undefined ? vals[j] : '').replace(/^"|"$/g, '').trim();
    }
    rows.push(obj);
  }
  return { headers, rows };
}

type TabType = 'strains' | 'products' | 'brands' | 'shops';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('strains');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [strains, setStrains] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [strainsRes, productsRes, brandsRes, shopsRes] = await Promise.all([
          fetch('/data/strains.csv'),
          fetch('/data/products.csv'),
          fetch('/data/brands.csv'),
          fetch('/data/shops.csv')
        ]);

        if (!strainsRes.ok || !productsRes.ok || !brandsRes.ok || !shopsRes.ok) {
          throw new Error('Failed to load dataset files from /data/');
        }

        const [strainsText, productsText, brandsText, shopsText] = await Promise.all([
          strainsRes.text(),
          productsRes.text(),
          brandsRes.text(),
          shopsRes.text()
        ]);

        setStrains(parseCSV(strainsText).rows);
        setProducts(parseCSV(productsText).rows);
        setBrands(parseCSV(brandsText).rows);
        setShops(parseCSV(shopsText).rows);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading datasets');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset page on tab change or filter change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setFilterType('all');
    setFilterState('all');
  }, [activeTab]);

  // Unique options for filters
  const strainTypes = useMemo(() => {
    const set = new Set(strains.map(s => s.type).filter(Boolean));
    return Array.from(set);
  }, [strains]);

  const shopStates = useMemo(() => {
    const set = new Set(shops.map(s => s.state).filter(s => s && s !== 'NULL'));
    return Array.from(set).sort();
  }, [shops]);

  const shopTypes = useMemo(() => {
    const set = new Set(shops.map(s => s.type).filter(s => s && s !== 'NULL'));
    return Array.from(set);
  }, [shops]);

  // Filtered data
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (activeTab === 'strains') {
      return strains.filter(item => {
        const matchesQ = !q || 
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.breeder && item.breeder.toLowerCase().includes(q)) ||
          (item.effects && item.effects.toLowerCase().includes(q)) ||
          (item.ailment && item.ailment.toLowerCase().includes(q)) ||
          (item.flavor && item.flavor.toLowerCase().includes(q)) ||
          (item.terpenes && item.terpenes.toLowerCase().includes(q));
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesQ && matchesType;
      });
    } else if (activeTab === 'products') {
      return products.filter(item => {
        const matchesQ = !q ||
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q));
        return matchesQ;
      });
    } else if (activeTab === 'brands') {
      return brands.filter(item => {
        const matchesQ = !q ||
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q));
        const matchesState = filterState === 'all' || (item.location && item.location.trim() === filterState);
        return matchesQ && matchesState;
      });
    } else {
      return shops.filter(item => {
        const matchesQ = !q ||
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.city && item.city.toLowerCase().includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q));
        const matchesState = filterState === 'all' || (item.state && item.state.trim() === filterState);
        const matchesType = filterType === 'all' || (item.type && item.type.includes(filterType));
        return matchesQ && matchesState && matchesType;
      });
    }
  }, [activeTab, strains, products, brands, shops, searchQuery, filterType, filterState]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportJSON = () => {
    const dataMap = { strains, products, brands, shops };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataMap[activeTab], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kushy_${activeTab}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400">
        <i className="fa-solid fa-cannabis fa-spin text-5xl mb-4"></i>
        <h2 className="text-xl font-semibold tracking-wide">Loading Kushy Datasets...</h2>
        <p className="text-slate-400 text-sm mt-2">Parsing 31,000+ botanical records & dispensaries</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-6">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Datasets</h2>
        <p className="text-slate-300 max-w-md text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Leaf className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Kushy Explorer
              </h1>
              <p className="text-xs text-slate-400 font-medium">Cannabis Datasets Search Engine (2017)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportJSON}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition shadow-sm"
              title="Export filtered records to JSON"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{filteredData.length.toLocaleString()} records indexed</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
        
        {/* Dataset Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'strains', label: 'Strains', icon: Leaf, count: strains.length, desc: 'Genetics, THC/CBD, Terpenes' },
            { id: 'products', label: 'Products', icon: Package, count: products.length, desc: 'Edibles, Concentrates, Flowers' },
            { id: 'brands', label: 'Brands', icon: Building2, count: brands.length, desc: 'Producers & Extractors' },
            { id: 'shops', label: 'Dispensaries', icon: Store, count: shops.length, desc: 'Shops, Delivery, Locations' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive 
                    ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2.5 rounded-xl ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count.toLocaleString()}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${isActive ? 'text-white' : 'text-slate-200'}`}>{tab.label}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tab.desc}</p>
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, brand, effects...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {activeTab === 'strains' && (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  {strainTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {(activeTab === 'brands' || activeTab === 'shops') && (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All States / Locations</option>
                  {shopStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'shops' && (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Store className="w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Shop Types</option>
                  {shopTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="text-xs text-slate-400 ml-auto">
              Showing <span className="text-emerald-400 font-semibold">{filteredData.length.toLocaleString()}</span> results
            </div>
          </div>
        </div>

        {/* Results Grid / List */}
        {filteredData.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Info className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No records found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((item, idx) => {
              if (activeTab === 'strains') {
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/30 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition">{item.name}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          item.type === 'Indica' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          item.type === 'Sativa' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.type || 'Hybrid'}
                        </span>
                      </div>
                      
                      {item.breeder && item.breeder !== 'NULL' && (
                        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{item.breeder}</span>
                        </p>
                      )}

                      {item.description && item.description !== 'NULL' && (
                        <div 
                          className="text-xs text-slate-300 line-clamp-3 mb-4 prose prose-invert"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 text-slate-400">
                        {item.thc && item.thc !== '0' && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-emerald-400">THC:</span> {item.thc}
                          </span>
                        )}
                        {item.cbd && item.cbd !== '0' && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-teal-400">CBD:</span> {item.cbd}
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              } else if (activeTab === 'products') {
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/30 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition">{item.name}</h4>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Product
                        </span>
                      </div>

                      {item.brand && (
                        <p className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{item.brand}</span>
                        </p>
                      )}

                      {item.category && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.category.split(',').filter(Boolean).map((cat, i) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>ID: {item.id}</span>
                      <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              } else if (activeTab === 'brands') {
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/30 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition">{item.name}</h4>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Brand
                        </span>
                      </div>

                      {item.location && item.location !== 'NULL' && (
                        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Location: {item.location.trim()}</span>
                        </p>
                      )}

                      {item.category && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.category.split(',').filter(Boolean).map((cat, i) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      {item.instagram && item.instagram !== 'NULL' ? (
                        <span className="text-pink-400 flex items-center gap-1">
                          <i className="fa-brands fa-instagram"></i> @{item.instagram}
                        </span>
                      ) : (
                        <span>Verified Brand</span>
                      )}
                      <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/30 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition">{item.name}</h4>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.type || 'Shop'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{[item.address, item.city, item.state, item.postcode].filter(Boolean).join(', ')}</span>
                      </p>

                      {item.lat && item.lng && item.lat !== 'NULL' && (
                        <div className="text-[10px] text-slate-500 mb-4">
                          GPS: {item.lat}, {item.lng}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{item.country || 'US'}</span>
                      <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-4 pb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 px-3">
              Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Kushy Datasets Explorer &bull; High Performance Static Frontend &bull; Powered by React & Tailwind CSS</p>
        <div className="mt-2">
          <a href="./flower.html" className="text-emerald-400 hover:text-emerald-300 transition-colors" target="_blank" rel="noopener noreferrer">Retour à la Comparaison CBD</a>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                {activeTab === 'strains' && <Leaf className="w-6 h-6" />}
                {activeTab === 'products' && <Package className="w-6 h-6" />}
                {activeTab === 'brands' && <Building2 className="w-6 h-6" />}
                {activeTab === 'shops' && <Store className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {activeTab.slice(0, -1)} Record #{selectedItem.id}
                </span>
                <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {/* Strains specific details */}
              {activeTab === 'strains' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Type</span>
                      <p className="text-white font-bold mt-0.5">{selectedItem.type || 'Hybrid'}</p>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">THC</span>
                      <p className="text-emerald-400 font-bold mt-0.5">{selectedItem.thc || '0'}</p>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">CBD</span>
                      <p className="text-teal-400 font-bold mt-0.5">{selectedItem.cbd || '0'}</p>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">CBN</span>
                      <p className="text-amber-400 font-bold mt-0.5">{selectedItem.cbn || '0'}</p>
                    </div>
                  </div>

                  {selectedItem.description && selectedItem.description !== 'NULL' && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Description</h4>
                      <div 
                        className="text-sm text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedItem.effects && selectedItem.effects !== 'NULL' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-bold uppercase text-emerald-400 mb-2">Effects</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.effects.split(',').map((eff: string, i: number) => (
                            <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              {eff.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.ailment && selectedItem.ailment !== 'NULL' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-bold uppercase text-teal-400 mb-2">Ailments / Medical</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.ailment.split(',').map((ail: string, i: number) => (
                            <span key={i} className="text-xs bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-1 rounded-lg">
                              {ail.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.flavor && selectedItem.flavor !== 'NULL' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-bold uppercase text-amber-400 mb-2">Flavors</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.flavor.split(',').map((fl: string, i: number) => (
                            <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                              {fl.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.terpenes && selectedItem.terpenes !== 'NULL' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-bold uppercase text-purple-400 mb-2">Terpenes</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.terpenes.split(',').map((terp: string, i: number) => (
                            <span key={i} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                              {terp.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Products specific details */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Brand</span>
                      <p className="text-white font-bold text-lg">{selectedItem.brand || 'Unknown Brand'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedItem.category ? selectedItem.category.split(',').filter(Boolean).map((cat: string, i: number) => (
                          <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            {cat.trim()}
                          </span>
                        )) : <span className="text-slate-400 text-sm">Uncategorized</span>}
                      </div>
                    </div>
                    {selectedItem.slug && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Slug</span>
                        <p className="text-slate-300 font-mono text-xs mt-0.5">{selectedItem.slug}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brands specific details */}
              {activeTab === 'brands' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
                      <p className="text-white font-bold text-lg">{selectedItem.location || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedItem.category ? selectedItem.category.split(',').filter(Boolean).map((cat: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                            {cat.trim()}
                          </span>
                        )) : <span className="text-slate-400 text-sm">Uncategorized</span>}
                      </div>
                    </div>
                    {selectedItem.instagram && selectedItem.instagram !== 'NULL' && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Instagram</span>
                        <p className="text-pink-400 text-sm mt-0.5 flex items-center gap-1.5">
                          <i className="fa-brands fa-instagram"></i> @{selectedItem.instagram}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shops specific details */}
              {activeTab === 'shops' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                      <p className="text-white font-bold text-base">
                        {[selectedItem.address, selectedItem.city, selectedItem.state, selectedItem.postcode].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Shop Type</span>
                        <p className="text-emerald-400 font-semibold mt-0.5">{selectedItem.type || 'Dispensary'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Country</span>
                        <p className="text-slate-300 font-semibold mt-0.5">{selectedItem.country || 'US'}</p>
                      </div>
                    </div>
                    {selectedItem.lat && selectedItem.lng && selectedItem.lat !== 'NULL' && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Geolocation</span>
                        <p className="text-slate-300 font-mono text-xs mt-0.5">Latitude: {selectedItem.lat}, Longitude: {selectedItem.lng}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
