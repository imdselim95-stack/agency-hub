import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lead_id, feedback_type, notes } = req.body;
  if (!lead_id || !feedback_type) {
    return res.status(400).json({ error: 'Missing lead_id or feedback_type' });
  }

  try {
    const { data, error } = await supabase
      .from('lead_feedback')
      .insert([{ lead_id, feedback_type, notes: notes || '' }])
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error storing feedback:', error);
    res.status(500).json({ error: error.message || 'Failed to record feedback' });
  }
}