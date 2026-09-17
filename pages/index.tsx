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
  DollarSign,
  Filter,
  CheckCircle2,
  Send,
  Trophy,
  Archive,
  Flame
} from 'lucide-react';

interface Lead {
  id: number;
  date: string;
  link: string;
  pitch: string;
  platform: string;
  status: string;
  score: number;
  category: string;
  budget: string;
  pain_summary: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to sync status with database:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.pitch.toLowerCase().includes(search.toLowerCase()) ||
        lead.pain_summary.toLowerCase().includes(search.toLowerCase()) ||
        lead.link.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus =
        selectedStatus === 'All' 
          ? lead.status !== 'Archived' 
          : lead.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, selectedStatus]);

  const stats = useMemo(() => {
    const total = leads.filter(l => l.status !== 'Archived').length;
    const highIntent = leads.filter((l) => l.score >= 80 && l.status !== 'Archived').length;
    const contacted = leads.filter((l) => l.status === 'Contacted').length;
    const won = leads.filter((l) => l.status === 'Won').length;
    return { total, highIntent, contacted, won };
  }, [leads]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Head>
        <title>LeadScout V3 | Executive CRM Command</title>
      </Head>

      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                LeadScout <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800">V3 CRM Active</span>
              </h1>
              <p className="text-xs text-slate-400">Autonomous MVP & Web Tool Client Acquisition</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-medium">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>Deduplication & AI Active</span>
            </div>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dynamic V3 Real-World KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Pipeline</span>
              <Briefcase className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.total}</span>
              <span className="text-xs text-slate-500 font-medium">Vetted Leads</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Intent (80+)</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.highIntent}</span>
              <span className="text-xs text-orange-400 font-medium">Hot Founders</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Contacted</span>
              <Send className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.contacted}</span>
              <span className="text-xs text-sky-400 font-medium">In Talks</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Deals Won</span>
              <Trophy className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{stats.won}</span>
              <span className="text-xs text-emerald-500 font-medium">Closed Clients</span>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by pain point or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* CRM Stage Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'New', 'Contacted', 'Won', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStatus === status
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Lead Opportunities Stream */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>High-Ticket Pipeline</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                {filteredLeads.length} Available
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Syncing live opportunities from Supabase...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Briefcase className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold">No opportunities in this stage</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your Cloud Scout runs automatically every 12 hours. High-intent opportunities will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {filteredLeads.map((lead) => {
                const isHighQuality = lead.score >= 80;
                return (
                  <div
                    key={lead.id}
                    className="p-6 hover:bg-slate-800/30 transition flex flex-col gap-4 group"
                  >
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Score Badge */}
                        <div
                          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            isHighQuality
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 shadow-sm shadow-emerald-900/30'
                              : 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
                          }`}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Score: {lead.score}/100</span>
                        </div>

                        {/* Category */}
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          {lead.category}
                        </span>

                        {/* Budget Tag */}
                        {lead.budget && lead.budget !== 'Unknown' && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                            <DollarSign className="h-3 w-3" />
                            <span>{lead.budget}</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-mono ml-1">
                          {lead.date ? new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>

                      {/* Interactive CRM Status Action Buttons */}
                      <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                        {['New', 'Contacted', 'Won', 'Archived'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => handleUpdateStatus(lead.id, statusOption)}
                            disabled={updatingId === lead.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              lead.status === statusOption
                                ? statusOption === 'Won'
                                  ? 'bg-emerald-500 text-black font-bold'
                                  : statusOption === 'Contacted'
                                  ? 'bg-sky-500 text-black font-bold'
                                  : statusOption === 'Archived'
                                  ? 'bg-slate-700 text-slate-200 font-bold'
                                  : 'bg-cyan-500 text-black font-bold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                          >
                            {statusOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Extracted Business Bottleneck / Pain Summary */}
                    {lead.pain_summary && (
                      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 text-xs text-amber-200 leading-relaxed">
                        <strong className="text-amber-400 uppercase tracking-wider font-semibold mr-1.5">Bottleneck:</strong>
                        {lead.pain_summary}
                      </div>
                    )}

                    {/* AI Pitch Proposal */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                        <span>Tailored Proposal (Citing ToolVerse / ImageTools)</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {lead.pitch}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center pt-1">
                      <div className="text-xs text-slate-500 truncate max-w-xl font-mono">
                        Target: {lead.link}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
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
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
