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
  DollarSign, 
  Send,
  Trophy,
  Flame,
  CheckCircle2,
  Inbox
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
      console.error('Failed to sync status:', err);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <Head>
        <title>LeadScout V3 | Executive Agency Command</title>
      </Head>

      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                LeadScout <span className="text-cyan-700 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 font-semibold">V3 Pro Active</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Autonomous MVP & Web Tool Client Acquisition</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              <span>Deduplication & AI Active</span>
            </div>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition text-xs font-bold shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        
        {/* Metric KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Pipeline</span>
              <Briefcase className="h-4 w-4 text-cyan-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-500 font-medium">Vetted Leads</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">High Intent (80+)</span>
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-600">{stats.highIntent}</span>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">Hot Leads</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Contacted</span>
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">{stats.contacted}</span>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">In Talks</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Deals Won</span>
              <Trophy className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{stats.won}</span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Closed Clients</span>
            </div>
          </div>
        </section>

        {/* Search & CRM Tabs */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bottleneck, keyword, or link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-600 focus:bg-white transition"
            />
          </div>

          {/* CRM Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'New', 'Contacted', 'Won', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Opportunity Stream */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>High-Ticket Pipeline</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-mono font-bold">
                {filteredLeads.length} Available
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-sm text-slate-600 font-bold">Loading live verified opportunities...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-20 text-center space-y-3">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-base text-slate-800 font-bold">No opportunities in this stage</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                The autonomous cloud scraper runs continuously and will populate new founder leads here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isHighQuality = lead.score >= 80;
                return (
                  <div
                    key={lead.id}
                    className="p-6 hover:bg-slate-50/60 transition flex flex-col gap-4.5"
                  >
                    {/* Card Badges Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Score Tag */}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-lg border ${
                            isHighQuality
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                              : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Score: {lead.score}/100</span>
                        </div>

                        {/* Category */}
                        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.category}
                        </span>

                        {/* Budget Tag */}
                        {lead.budget && lead.budget !== 'Unknown' && (
                          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{lead.budget}</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono font-medium ml-1">
                          {lead.date ? new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>

                      {/* Interactive CRM Status Switcher */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['New', 'Contacted', 'Won', 'Archived'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => handleUpdateStatus(lead.id, statusOption)}
                            disabled={updatingId === lead.id}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              lead.status === statusOption
                                ? statusOption === 'Won'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : statusOption === 'Contacted'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : statusOption === 'Archived'
                                  ? 'bg-slate-700 text-white shadow-xs'
                                  : 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                            }`}
                          >
                            {statusOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottleneck Summary Box */}
                    {lead.pain_summary && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 font-medium leading-relaxed shadow-2xs">
                        <span className="text-amber-800 uppercase tracking-wider font-extrabold mr-2">Bottleneck:</span>
                        <span>{lead.pain_summary}</span>
                      </div>
                    )}

                    {/* Proposal Pitch Box */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4.5 space-y-2">
                      <div className="text-[11px] uppercase tracking-wider font-black text-slate-500 flex items-center justify-between">
                        <span>Tailored Proposal (Citing ToolVerse / ImageTools)</span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-normal">
                        {lead.pitch}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-1">
                      <div className="text-xs text-slate-500 truncate max-w-xl font-mono">
                        Target: <span className="text-slate-700 font-semibold">{lead.link}</span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleCopy(lead.id, lead.pitch)}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border shadow-2xs ${
                            copiedId === lead.id
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          {copiedId === lead.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copied Pitch!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-500" />
                              <span>Copy Proposal</span>
                            </>
                          )}
                        </button>

                        <a
                          href={lead.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm shadow-cyan-600/20"
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
