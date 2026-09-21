import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((row) => ({
      id: row.id,
      date: row.created_at,
      link: row.link,
      title: row.title || 'Untitled Opportunity',
      source: row.source || 'Reddit',
      source_type: row.source_type || 'community_post',
      classification: row.classification || 'POTENTIAL_LEAD',
      pitch: row.pitch || '',
      status: row.status || 'New',
      overall_score: row.overall_score || row.score || 0,
      score: row.score || row.overall_score || 0,
      buyer_intent_score: row.buyer_intent_score || 0,
      skill_match_score: row.skill_match_score || 0,
      problem_clarity_score: row.problem_clarity_score || 0,
      budget_score: row.budget_score || 0,
      urgency_score: row.urgency_score || 0,
      matched_skills: Array.isArray(row.matched_skills) ? row.matched_skills : [],
      missing_skills: Array.isArray(row.missing_skills) ? row.missing_skills : [],
      qualification_reason: row.qualification_reason || '',
      rejection_reason: row.rejection_reason || '',
      intent_evidence: row.intent_evidence || 'Not detected',
      skill_evidence: row.skill_evidence || 'Not detected',
      budget_evidence: row.budget_evidence || 'Not detected',
      budget: row.budget || 'Negotiable',
      category: row.category || 'General',
      pain_summary: row.pain_summary || '',
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Error loading V3 Supabase leads:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leads' });
  }
}
