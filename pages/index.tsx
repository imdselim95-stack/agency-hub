import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Briefcase, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  Layers,
  Filter
} from 'lucide-react';

interface Lead {
  id: number;
  date: string;
  link: string;
  pitch: string;
  status: string;
  platform: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error(err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.pitch.toLowerCase().includes(search.toLowerCase()) ||
        lead.link.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform =
        selectedPlatform === 'All' || lead.platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    });
  }, [leads, search, selectedPlatform]);

  const stats = useMemo(() => {
    const total = leads.length;
    const reddit = leads.filter((l) => l.platform === 'Reddit').length;
    const ready = leads.filter((l) => !l.pitch.toLowerCase().includes('pending')).length;
    return { total, reddit, ready };
  }, [leads]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Head>
        <title>Agency Lead Scout Hub | Executive Command</title>
      </Head>

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                LeadScout <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800">HQ v2.0</span>
              </h1>
              <p className="text-xs text-slate-400">Autonomous Client Acquisition Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/80 text-emerald-400 text-xs font-medium">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>Cron Scanner Active</span>
            </div>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Scouted Leads</span>
              <Briefcase className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.total}</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center">Live in CRM</span>
            </div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ready to Pitch</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.ready}</span>
              <span className="text-xs text-slate-400 font-medium">AI Custom Pitches</span>
            </div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reddit Channels</span>
              <Layers className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.reddit}</span>
              <span className="text-xs text-slate-400 font-medium">Community Leads</span>
            </div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1 mr-1 hidden sm:block" />
            {['All', 'Reddit', 'IndieHackers', 'Twitter'].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedPlatform === platform
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </section>

        {/* Lead Stream Table */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Verified Client Feed</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                {filteredLeads.length} Available
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Syncing live opportunities from Google Sheets...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Briefcase className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold">No leads found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No opportunities match your filter. The Cloud Scout runs on schedule and updates your feed automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 hover:bg-slate-800/30 transition flex flex-col lg:flex-row gap-5 lg:items-center justify-between group"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          lead.platform === 'Reddit'
                            ? 'bg-orange-950/60 text-orange-400 border-orange-800/60'
                            : lead.platform === 'Twitter/X'
                            ? 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                            : 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60'
                        }`}
                      >
                        {lead.platform}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {lead.date ? new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-medium">
                        {lead.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      {lead.pitch}
                    </p>

                    <div className="text-xs text-slate-500 truncate max-w-xl font-mono">
                      Target: {lead.link}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-end">
                    <button
                      onClick={() => handleCopy(lead.id, lead.pitch)}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                        copiedId === lead.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      {copiedId === lead.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied Pitch!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>Copy Proposal</span>
                        </>
                      )}
                    </button>

                    <a
                      href={lead.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/10"
                    >
                      <span>Open Post</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
