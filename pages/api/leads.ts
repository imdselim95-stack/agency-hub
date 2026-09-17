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
      pitch: row.pitch || '',
      platform: row.platform || 'Reddit',
      status: row.status || 'New',
      score: row.score || 0,
      category: row.category || 'General',
      budget: row.budget || 'Unknown',
      pain_summary: row.pain_summary || '',
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Error loading Supabase leads:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leads' });
  }
}
