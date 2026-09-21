import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Briefcase, Search, ExternalLink, Copy, Check, RefreshCw, 
  Sparkles, Radio, DollarSign, Send, Trophy, Flame, 
  ThumbsUp, ThumbsDown, AlertTriangle, ShieldCheck, Tag,
  ChevronDown, ChevronUp, Layers, CheckCircle2, Inbox
} from 'lucide-react';

interface LeadV3 {
  id: number;
  date: string;
  link: string;
  title: string;
  source: string;
  classification: string;
  pitch: string;
  status: string;
  overall_score: number;
  score: number;
  buyer_intent_score: number;
  skill_match_score: number;
  problem_clarity_score: number;
  budget_score: number;
  urgency_score: number;
  matched_skills: string[];
  missing_skills: string[];
  qualification_reason: string;
  intent_evidence: string;
  budget_evidence: string;
  skill_evidence: string;
  budget: string;
  category: string;
  pain_summary: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<LeadV3[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<number, string>>({});

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch (err) {
      console.error(err);
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

  const handleFeedback = async (leadId: number, type: string) => {
    setFeedbackSent((prev) => ({ ...prev, [leadId]: type }));
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, feedback_type: type }),
      });
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    try {
      await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.pitch.toLowerCase().includes(search.toLowerCase()) ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.pain_summary.toLowerCase().includes(search.toLowerCase()) ||
        l.link.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = selectedStatus === 'All' ? l.status !== 'Archived' : l.status === selectedStatus;
      const matchesSource = selectedSource === 'All' || l.source === selectedSource;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, selectedStatus, selectedSource]);

  const stats = useMemo(() => {
    const active = leads.filter(l => l.status !== 'Archived');
    const total = active.length;
    const highIntent = active.filter(l => (l.overall_score || l.score) >= 80).length;
    const contacted = leads.filter(l => l.status === 'Contacted').length;
    const won = leads.filter(l => l.status === 'Won').length;
    const redditCount = leads.filter(l => l.source === 'Reddit').length;
    const ihCount = leads.filter(l => l.source === 'IndieHackers').length;

    return { total, highIntent, contacted, won, redditCount, ihCount };
  }, [leads]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <Head>
        <title>LeadScout V3 | Opportunity Intelligence Hub</title>
      </Head>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/20 font-black">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                LeadScout <span className="text-cyan-800 font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 font-bold">V3 Intelligence Active</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Personal Opportunity Agent · Evidence-Grounded Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              <span>Multi-Tier Dedup & AI Active</span>
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
        
        {/* KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Pipeline</span>
              <Briefcase className="h-4 w-4 text-cyan-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-500 font-medium">Qualified Leads</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">High Intent (80+)</span>
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-600">{stats.highIntent}</span>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">Priority Targets</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Contacted</span>
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">{stats.contacted}</span>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">In Dialogue</span>
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

        {/* Source Filter Strip */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tech, pain point, or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-600 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
              <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider">Source:</span>
              {['All', 'Reddit', 'IndieHackers'].map((src) => (
                <button
                  key={src}
                  onClick={() => setSelectedSource(src)}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedSource === src
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {src} {src === 'Reddit' ? `(${stats.redditCount})` : src === 'IndieHackers' ? `(${stats.ihCount})` : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['All', 'New', 'Contacted', 'Won', 'Archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedStatus === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunity Stream */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Verified Opportunity Feed</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-mono font-bold">
                {filteredLeads.length} Matches
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-sm text-slate-600 font-bold">Loading evidence-grounded opportunities...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-20 text-center space-y-3">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-base text-slate-800 font-bold">No opportunities match this filter</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                LeadScout runs automated sweeps and will only ingest verified opportunities that meet your skill profile.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isHighIntent = (lead.overall_score || lead.score) >= 80;
                const isExpanded = expandedId === lead.id;

                return (
                  <div key={lead.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col gap-4">
                    
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-lg border ${
                            isHighIntent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                              : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Score: {lead.overall_score || lead.score}/100</span>
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                          {lead.classification}
                        </span>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.source}
                        </span>

                        {lead.budget && lead.budget !== 'Negotiable' && (
                          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{lead.budget}</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono font-medium ml-1">
                          {lead.date ? new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>

                      {/* CRM Status Action Switcher */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['New', 'Contacted', 'Won', 'Archived'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => handleUpdateStatus(lead.id, statusOption)}
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

                    {/* Matched Skills Chips */}
                    {lead.matched_skills && lead.matched_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mr-1">Skills:</span>
                        {lead.matched_skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* SECTION 20: WHY THIS LEAD PANEL */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-black text-slate-700 uppercase tracking-wider text-[11px]">
                        <span className="flex items-center gap-1.5 text-cyan-900">
                          <ShieldCheck className="h-4 w-4 text-cyan-600" />
                          <span>Why LeadScout Recommended This</span>
                        </span>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                          className="text-cyan-700 hover:underline flex items-center gap-1 text-[11px] font-bold"
                        >
                          <span>{isExpanded ? 'Hide Sub-scores & Evidence' : 'View Sub-scores & Evidence'}</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-medium">
                        {lead.qualification_reason || lead.pain_summary}
                      </p>

                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Skill Match (30%)</span>
                              <span className="text-slate-800 font-extrabold">{lead.skill_match_score || 0}/100</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Buyer Intent (25%)</span>
                              <span className="text-slate-800 font-extrabold">{lead.buyer_intent_score || 0}/100</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Problem Clarity (15%)</span>
                              <span className="text-slate-800 font-extrabold">{lead.problem_clarity_score || 0}/100</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Urgency (10%)</span>
                              <span className="text-slate-800 font-extrabold">{lead.urgency_score || 0}/100</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                              <strong className="text-amber-800 block text-[10px] uppercase tracking-wider mb-0.5">Verbatim Intent Evidence:</strong>
                              "{lead.intent_evidence}"
                            </div>
                            <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 text-purple-950 font-medium">
                              <strong className="text-purple-800 block text-[10px] uppercase tracking-wider mb-0.5">Verbatim Budget Evidence:</strong>
                              "{lead.budget_evidence}"
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Proposal Pitch Draft */}
                    {lead.pitch && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                        <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                          <span>Tailored Outreach Pitch (Citing Live Portfolio Tools)</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-normal">
                          {lead.pitch}
                        </p>
                      </div>
                    )}

                    {/* Operator Feedback Strip */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                        <span className="text-[11px] text-slate-400 mr-1">Feedback:</span>
                        {[
                          { label: '👍 Useful', type: 'Useful' },
                          { label: '👎 Bad Lead', type: 'Bad Lead' },
                          { label: '❌ Not My Skill', type: 'Not My Skill' },
                          { label: '💰 No Budget', type: 'No Budget' },
                          { label: '🗣️ Discussion Only', type: 'Discussion Only' }
                        ].map((btn) => (
                          <button
                            key={btn.type}
                            onClick={() => handleFeedback(lead.id, btn.type)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${
                              feedbackSent[lead.id] === btn.type
                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
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
                              <span>Copy Pitch</span>
                            </>
                          )}
                        </button>

                        <a
                          href={lead.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-xs"
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
