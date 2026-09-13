import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format fields to match the UI component
    const formatted = (data || []).map((row) => ({
      id: row.id,
      date: row.created_at,
      link: row.link,
      pitch: row.pitch,
      platform: row.platform || 'Reddit',
      status: row.status || 'New',
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Error loading Supabase leads:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leads' });
  }
}
